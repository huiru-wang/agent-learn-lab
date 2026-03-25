import { NextRequest, NextResponse } from 'next/server';
import { chatCompletionStream, type ChatMessage } from '@/lib/llm-client';
import { getModelConfigById, BUILTIN_MCP_SERVERS, getMcpConfigs } from '@/lib/config';
import {
  connectToMCPServer,
  callMCPTool,
  disconnectAllMCPServers,
  type MCPTool,
} from '@/lib/react-mcp';

const MAX_ITERATIONS = 10;

interface ToolInfo {
  name: string;  // 完整名称 "serverName:toolName"
  serverName: string;
  toolName: string;
  description?: string;
  inputSchema: unknown;
}

interface ToolCallResult {
  toolCallId: string;
  toolName: string;
  arguments: Record<string, unknown>;
}

interface ChunkData {
  chunk?: {
    parsed?: {
      choices?: Array<{
        delta?: {
          content?: string;
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

  // 获取所有可用的 MCP 服务器
  const allServers = [
    ...BUILTIN_MCP_SERVERS.map((s) => ({ name: s.name, serverUrl: s.serverUrl, authHeader: s.authHeader })),
    ...(await getMcpConfigs()).map((s) => ({ name: s.name, serverUrl: s.serverUrl, authHeader: s.authHeader })),
  ];

  // 连接每个启用的 MCP 服务器
  const serverToolsMap = new Map<string, { tools: MCPTool[]; serverUrl: string }>();

  for (const toolId of enabledToolIds) {
    // toolId 格式: "serverName:toolName"
    const [serverName, toolName] = toolId.split(':');
    if (!serverName || !toolName) continue;

    // 查找服务器
    const server = allServers.find((s) => s.name === serverName);
    if (!server) continue;

    // 如果还没连接过这个服务器，先连接
    if (!serverToolsMap.has(serverName)) {
      try {
        const { tools } = await connectToMCPServer(server);
        serverToolsMap.set(serverName, { tools, serverUrl: server.serverUrl });
      } catch (error) {
        console.error(`Failed to connect to MCP server ${serverName}:`, error);
        continue;
      }
    }

    // 查找工具定义
    const serverInfo = serverToolsMap.get(serverName)!;
    const tool = serverInfo.tools.find((t) => t.name === toolName);
    if (!tool) continue;

    // 添加到结果
    result.push({
      name: toolId,
      serverName,
      toolName,
      description: tool.description,
      inputSchema: tool.inputSchema,
    });

    // 添加到 LLM 工具定义
    toolDefs.push({
      name: toolId,  // 使用完整名称
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
  // toolName 格式: "serverName:actualToolName"
  const [serverName, actualToolName] = toolName.split(':');
  if (!serverName || !actualToolName) {
    return JSON.stringify({ error: `无效的工具名称: ${toolName}` });
  }

  // 获取服务器信息
  const allServers = [
    ...BUILTIN_MCP_SERVERS.map((s) => ({ name: s.name, serverUrl: s.serverUrl, authHeader: s.authHeader })),
    ...(await getMcpConfigs()).map((s) => ({ name: s.name, serverUrl: s.serverUrl, authHeader: s.authHeader })),
  ];

  const server = allServers.find((s) => s.name === serverName);
  if (!server) {
    return JSON.stringify({ error: `服务器未找到: ${serverName}` });
  }

  // 连接并调用工具
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

    if (!enabledToolIds || !Array.isArray(enabledToolIds) || enabledToolIds.length === 0) {
      return new Response(JSON.stringify({ error: '请至少选择一个工具' }), { status: 400 });
    }

    const modelConfig = await getModelConfigById(modelId);
    if (!modelConfig) {
      return new Response(JSON.stringify({ error: `模型未找到: ${modelId}` }), { status: 400 });
    }

    // 获取启用的工具
    const { tools: enabledTools, toolDefinitions } = await getEnabledTools(enabledToolIds);

    if (enabledTools.length === 0) {
      return new Response(JSON.stringify({ error: '没有可用的工具' }), { status: 400 });
    }

    // 构建工具描述
    const toolsDescription = enabledTools
      .map((t) => `- ${t.name}: ${t.description || '调用 ' + t.serverName + ' 的 ' + t.toolName}`)
      .join('\n');

    const systemPrompt = `你是一个 ReAct (Reasoning + Acting) Agent。

## 你的工作方式
1. 先进行推理思考（Thought），用中文说明
2. 如果需要执行工具，使用工具调用
3. 观察工具返回结果
4. 根据结果继续或给出最终答案

## 可用工具
${toolsDescription}

## 重要规则
- 每次回复先用"思考:"开头说明推理过程
- 如果需要工具，使用工具调用（工具名称为完整名称，如 "${enabledTools[0]?.name}"）
- 如果已有足够信息，给出"最终答案: xxx"

现在开始执行任务。`;

    // 消息历史
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: task },
    ];

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        let iteration = 0;
        let totalUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

        send({ type: 'request', request: { model: modelConfig.model, messages: messages.slice(1) } });

        while (iteration < MAX_ITERATIONS) {
          iteration++;

          let accumulatedContent = '';
          let toolCallResults: ToolCallResult[] = [];
          let currentToolCalls: Array<{ id: string; function: { name: string; arguments: string } }> = [];

          // 流式读取 LLM 响应
          for await (const event of chatCompletionStream({
            model: modelConfig,
            messages,
            stream: true,
            tools: toolDefinitions,
          })) {
            if (event.type === 'chunk') {
              // 累积 content 用于 UI 展示
              const chunkData = event.data as ChunkData;
              const delta = chunkData.chunk?.parsed?.choices?.[0]?.delta;
              if (delta?.content) {
                accumulatedContent += delta.content;
                send({ type: 'thought_delta', delta: delta.content });
              }
            } else if (event.type === 'tool_call_complete') {
              // 从 tool_call_complete 事件获取所有工具调用结果
              const tcData = event.data as ToolCallCompleteData;
              currentToolCalls = tcData.tool_calls?.map((tc) => ({
                id: tc.id || `call_${Date.now()}`,
                function: {
                  name: tc.function?.name || '',
                  arguments: tc.function?.arguments || '',
                },
              })) || [];
              // 解析所有工具调用
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
            } else if (event.type === 'done') {
              const doneData = event.data as { usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } };
              if (doneData.usage) {
                totalUsage = doneData.usage;
              }
            } else if (event.type === 'error') {
              const errData = event.data as { error: string };
              send({ type: 'error', error: errData.error });
              controller.close();
              // 清理 MCP 连接
              await disconnectAllMCPServers();
              return;
            }
          }

          // 发送完整思考
          if (accumulatedContent.trim()) {
            send({ type: 'thought', thought: accumulatedContent });
          }

          // 先处理工具调用（如果有）
          let hasToolCalls = false;
          if (toolCallResults.length > 0) {
            hasToolCalls = true;
            // 遍历所有工具调用
            for (const toolCallResult of toolCallResults) {
              // 检查工具是否在启用列表中
              const isEnabled = enabledTools.some((t) => t.name === toolCallResult.toolName);
              if (!isEnabled) {
                send({ type: 'observation', observation: JSON.stringify({ error: `工具未启用: ${toolCallResult.toolName}` }) });
                continue;
              }

              send({ type: 'action', toolName: toolCallResult.toolName, arguments: toolCallResult.arguments });

              // 调用 MCP 工具
              const observation = await executeMcpTool(toolCallResult.toolName, toolCallResult.arguments);
              send({ type: 'observation', observation });

              // 更新消息历史 - 包含 tool_calls
              messages.push({
                role: 'assistant',
                content: accumulatedContent || `[调用工具: ${toolCallResult.toolName}]`,
                tool_calls: currentToolCalls.map((tc) => ({
                  id: tc.id,
                  type: 'function' as const,
                  function: {
                    name: tc.function.name,
                    arguments: tc.function.arguments,
                  },
                })),
              });
              messages.push({
                role: 'tool',
                content: observation,
                tool_call_id: toolCallResult.toolCallId,
                name: toolCallResult.toolName,
              });
            }
          }

          // 检查是否包含最终答案（只在没有工具调用时才检查）
          const finalAnswerMatch = accumulatedContent.match(/(?:最终答案|Final Answer)[:：]?\s*(.+)/i);
          if (finalAnswerMatch && !hasToolCalls) {
            send({ type: 'final_answer', answer: finalAnswerMatch[1].trim() });
            send({ type: 'done', usage: totalUsage });
            controller.close();
            // 清理 MCP 连接
            await disconnectAllMCPServers();
            return;
          } else if (accumulatedContent.trim()) {
            // 有思考但没有工具调用和最终答案，继续推理
            messages.push({ role: 'assistant', content: accumulatedContent });
          } else {
            // 无输出，强制终止
            break;
          }
        }

        // 达到最大迭代次数
        send({ type: 'error', error: `执行已达最大迭代次数 (${MAX_ITERATIONS})` });
        send({ type: 'done', usage: totalUsage });
        controller.close();
        // 清理 MCP 连接
        await disconnectAllMCPServers();
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
