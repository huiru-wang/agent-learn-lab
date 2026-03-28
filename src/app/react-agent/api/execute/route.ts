import { NextRequest } from 'next/server';
import { chatCompletionStream, type ChatMessage } from '@/lib/llm-client';
import { getModelConfigById, getBuiltinMcpConfigs, getMcpConfigs, validateModelForAgent } from '@/lib/config';
import {
    connectToMCPServer,
    callMCPTool,
    disconnectAllMCPServers,
    type MCPTool,
} from '@/lib/react-mcp';
import { createTimestamp } from '@/lib/chat-utils';
import { toToolDefinitions } from '../../lib/tools';
import { getReactAgentPromptWithTools, getReactAgentPromptNoTools } from '@/lib/prompts';

const MAX_ITERATIONS = 30;

/**
 * 从 toolId 中提取服务器名称
 */
function extractServerName(toolId: string): { serverName: string; toolName: string } | null {
    const parts = toolId.split(':');
    if (parts.length !== 2) return null;

    const serverId = parts[0];
    const toolName = parts[1];
    let serverName: string;

    if (serverId.startsWith('builtin_')) {
        serverName = serverId.slice('builtin_'.length);
    } else if (serverId.startsWith('user_')) {
        const withoutPrefix = serverId.slice('user_'.length);
        const lastUnderscore = withoutPrefix.lastIndexOf('_');
        serverName = lastUnderscore > 0 ? withoutPrefix.slice(0, lastUnderscore) : withoutPrefix;
    } else {
        serverName = serverId;
    }

    return { serverName, toolName };
}

interface ToolInfo {
    name: string;
    serverName: string;
    toolName: string;
    description?: string;
    inputSchema: unknown;
}

interface ChunkData {
    chunk?: {
        parsed?: {
            choices?: Array<{
                delta?: {
                    content?: string;
                    reasoning_content?: string;
                };
            }>;
        };
    };
}

interface ToolCallCompleteData {
    tool_calls?: Array<{
        id?: string;
        function?: {
            name?: string;
            arguments?: string;
        };
    }>;
}

/**
 * 获取启用的工具列表
 */
async function getEnabledTools(enabledToolIds: string[]): Promise<{
    tools: ToolInfo[];
    toolDefinitions: Array<{
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    }>;
}> {
    const result: ToolInfo[] = [];
    const toolDefs: Array<{
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    }> = [];

    const allServers = [
        ...(await getBuiltinMcpConfigs()).map((s) => ({ name: s.name, serverUrl: s.serverUrl, authHeader: s.authHeader })),
        ...(await getMcpConfigs()).map((s) => ({ name: s.name, serverUrl: s.serverUrl, authHeader: s.authHeader })),
    ];

    const serverToolsMap = new Map<string, { tools: MCPTool[]; serverUrl: string }>();

    for (const toolId of enabledToolIds) {
        const parsed = extractServerName(toolId);
        if (!parsed) continue;

        const { serverName, toolName } = parsed;
        const server = allServers.find((s) => s.name === serverName);
        if (!server) continue;

        if (!serverToolsMap.has(serverName)) {
            try {
                const { tools } = await connectToMCPServer(server);
                serverToolsMap.set(serverName, { tools, serverUrl: server.serverUrl });
            } catch {
                continue;
            }
        }

        const serverInfo = serverToolsMap.get(serverName)!;
        const tool = serverInfo.tools.find((t) => t.name === toolName);
        if (!tool) continue;

        result.push({
            name: toolId,
            serverName,
            toolName,
            description: tool.description,
            inputSchema: tool.inputSchema,
        });

        toolDefs.push({
            name: toolId,
            description: tool.description || `调用 ${serverName} 的 ${toolName} 工具`,
            parameters: tool.inputSchema as Record<string, unknown>,
        });
    }

    return { tools: result, toolDefinitions: toolDefs };
}

/**
 * 执行 MCP 工具调用
 */
async function executeMcpTool(
    toolName: string,
    args: Record<string, unknown>
): Promise<string> {
    const parsed = extractServerName(toolName);
    if (!parsed) {
        return JSON.stringify({ error: `无效的工具名称: ${toolName}` });
    }
    const { serverName, toolName: actualToolName } = parsed;

    const allServers = [
        ...(await getBuiltinMcpConfigs()).map((s) => ({ name: s.name, serverUrl: s.serverUrl, authHeader: s.authHeader })),
        ...(await getMcpConfigs()).map((s) => ({ name: s.name, serverUrl: s.serverUrl, authHeader: s.authHeader })),
    ];

    const server = allServers.find((s) => s.name === serverName);
    if (!server) {
        return JSON.stringify({ error: `服务器未找到: ${serverName}` });
    }

    try {
        const { sessionId } = await connectToMCPServer(server);
        const result = await callMCPTool(sessionId, actualToolName, args);
        if (result.success) {
            return JSON.stringify(result.result);
        } else {
            return JSON.stringify({ error: result.error });
        }
    } catch (error) {
        return JSON.stringify({ error: error instanceof Error ? error.message : '工具调用失败' });
    }
}

export async function POST(request: NextRequest) {
    const encoder = new TextEncoder();

    try {
        const body = await request.json();
        const { task, model: modelId, tools: enabledToolIds } = body;

        if (!task || typeof task !== 'string') {
            return new Response(JSON.stringify({ error: '缺少任务描述' }), { status: 400 });
        }

        if (!modelId) {
            return new Response(JSON.stringify({ error: '缺少模型 ID' }), { status: 400 });
        }

        const isAllowed = await validateModelForAgent('main', modelId);
        if (!isAllowed) {
            return new Response(JSON.stringify({ error: `Model "${modelId}" is not allowed.` }), { status: 400 });
        }

        const modelConfig = await getModelConfigById(modelId);
        if (!modelConfig) {
            return new Response(JSON.stringify({ error: `模型未找到: ${modelId}` }), { status: 400 });
        }

        // 获取启用的工具
        let enabledTools: Awaited<ReturnType<typeof getEnabledTools>>['tools'] = [];
        const toolDefinitions: Array<{ name: string; description: string; parameters: Record<string, unknown> }> = [];

        if (enabledToolIds && Array.isArray(enabledToolIds) && enabledToolIds.length > 0) {
            const localToolIds = enabledToolIds.filter((id) => !id.includes(':'));
            const mcpToolIds = enabledToolIds.filter((id) => id.includes(':'));

            if (localToolIds.length > 0) {
                const localDefs = toToolDefinitions().filter((t) => localToolIds.includes(t.name));
                toolDefinitions.push(...localDefs);
            }

            if (mcpToolIds.length > 0) {
                const result = await getEnabledTools(mcpToolIds);
                enabledTools = result.tools;
                toolDefinitions.push(...result.toolDefinitions);
            }
        }

        const hasTools = toolDefinitions.length > 0;
        const systemPrompt = hasTools
            ? getReactAgentPromptWithTools()
            : getReactAgentPromptNoTools();

        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: task },
        ];

        const stream = new ReadableStream({
            async start(controller) {
                const moduleType = 'react' as const;
                const send = (data: unknown) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ...(data as object), module: moduleType, timestamp: createTimestamp() })}\n\n`));
                };

                let iteration = 0;
                let totalUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

                send({
                    type: 'request',
                    request: {
                        model: modelConfig.model,
                        messages: messages.slice(1),
                        hasTools: toolDefinitions.length > 0,
                        toolsCount: toolDefinitions.length,
                        tools: toolDefinitions.map(t => t.name)
                    }
                });

                while (iteration < MAX_ITERATIONS) {
                    iteration++;

                    let accumulatedContent = '';
                    let accumulatedReasoning = '';
                    let toolCallResults: Array<{
                        toolCallId: string;
                        toolName: string;
                        arguments: Record<string, unknown>;
                    }> = [];
                    let currentToolCalls: Array<{
                        id: string;
                        function: { name: string; arguments: string };
                    }> = [];
                    let finishReason: string | undefined;

                    // 调用 LLM
                    for await (const event of chatCompletionStream({
                        model: modelConfig,
                        messages,
                        stream: true,
                        tools: toolDefinitions,
                        enableThinking: true,
                    })) {
                        if (event.type === 'chunk') {
                            const chunkData = event.data as ChunkData;
                            const delta = chunkData.chunk?.parsed?.choices?.[0]?.delta;

                            // 推理内容（thought）
                            if (delta?.reasoning_content) {
                                accumulatedReasoning += delta.reasoning_content;
                                send({ type: 'reasoning_delta', delta: delta.reasoning_content });
                            }

                            // 内容
                            if (delta?.content) {
                                accumulatedContent += delta.content;
                                send({ type: 'content_delta', delta: delta.content });
                            }
                        } else if (event.type === 'tool_call_complete') {
                            const tcData = event.data as ToolCallCompleteData;
                            currentToolCalls = tcData.tool_calls?.map((tc) => ({
                                id: tc.id || `call_${Date.now()}`,
                                function: {
                                    name: tc.function?.name || '',
                                    arguments: tc.function?.arguments || '',
                                },
                            })) || [];

                            toolCallResults = tcData.tool_calls?.map((tc) => {
                                let args: Record<string, unknown> = {};
                                try {
                                    args = JSON.parse(tc.function?.arguments || '{}');
                                } catch {
                                    // ignore
                                }
                                return {
                                    toolCallId: tc.id || `call_${Date.now()}`,
                                    toolName: tc.function?.name || '',
                                    arguments: args,
                                };
                            }) || [];
                            finishReason = 'tool_calls';
                        } else if (event.type === 'done') {
                            const doneData = event.data as {
                                usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
                                finish_reason?: string;
                            };
                            if (doneData.usage) {
                                totalUsage = doneData.usage;
                            }
                            finishReason = doneData.finish_reason;
                        } else if (event.type === 'error') {
                            const errData = event.data as { error: string };
                            send({ type: 'error', error: errData.error });
                            controller.close();
                            await disconnectAllMCPServers();
                            return;
                        }
                    }

                    // 如果是工具调用
                    if (finishReason === 'tool_calls' && toolCallResults.length > 0) {
                        // 执行工具调用
                        for (const toolCall of toolCallResults) {
                            const isEnabled = enabledTools.some((t) => t.name === toolCall.toolName);
                            if (!isEnabled) {
                                send({ type: 'observation', content: JSON.stringify({ error: `工具未启用: ${toolCall.toolName}` }), isError: true });
                                continue;
                            }

                            send({ type: 'action', toolName: toolCall.toolName, arguments: toolCall.arguments });

                            const observation = await executeMcpTool(toolCall.toolName, toolCall.arguments);
                            send({ type: 'observation', content: observation });

                            // 找到对应的 tool_call 信息
                            const currentTc = currentToolCalls.find((tc) => tc.id === toolCall.toolCallId);

                            // 添加 assistant 消息（包含推理内容或空内容）
                            messages.push({
                                role: 'assistant',
                                content: accumulatedContent || accumulatedReasoning,
                                tool_calls: currentTc
                                    ? [{
                                        id: currentTc.id,
                                        type: 'function' as const,
                                        function: {
                                            name: currentTc.function.name,
                                            arguments: currentTc.function.arguments,
                                        },
                                    }]
                                    : [],
                            });

                            // 添加 tool 消息
                            messages.push({
                                role: 'tool',
                                content: observation,
                                tool_call_id: toolCall.toolCallId,
                                name: toolCall.toolName,
                            });
                        }

                        // 继续下一轮迭代
                        continue;
                    }

                    // 如果 finish_reason === 'stop'，accumulatedContent 就是最终答案
                    if (finishReason === 'stop' && accumulatedContent.trim()) {
                        send({ type: 'final_answer', answer: accumulatedContent.trim() });
                        send({ type: 'done', usage: totalUsage });
                        controller.close();
                        await disconnectAllMCPServers();
                        return;
                    }

                    // 异常情况：无内容或达到最大迭代
                    if (iteration >= MAX_ITERATIONS) {
                        send({ type: 'error', error: `执行已达最大迭代次数 (${MAX_ITERATIONS})` });
                    } else if (!accumulatedContent.trim()) {
                        send({ type: 'error', error: '执行无输出' });
                    }
                    send({ type: 'done', usage: totalUsage });
                    controller.close();
                    await disconnectAllMCPServers();
                    return;
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}
