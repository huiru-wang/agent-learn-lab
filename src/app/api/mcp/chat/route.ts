import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getModelConfigById } from '@/lib/llm-client';
import {
    chatCompletionStream,
    type ChatMessage,
    type StreamToolCallCompleteData,
    type StreamDoneData,
    type StreamRequestData,
    type ToolDefinition,
} from '@/lib/llm-client';
import { getSession } from '@/app/mcp-protocol/lib/mcp-session';
import { createTimestamp } from '@/lib/chat-utils';

const RequestSchema = z.object({
    sessionId: z.string(),
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
        })
    ),
    model: z.string(),
});

type SendFn = (event: Record<string, unknown>) => void;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = RequestSchema.safeParse(body);

        if (!parsed.success) {
            return new Response(
                JSON.stringify({ error: 'Invalid request', details: parsed.error.issues }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { sessionId, messages: inputMessages, model: modelId } = parsed.data;

        const session = getSession(sessionId);
        if (!session) {
            return new Response(
                JSON.stringify({ error: 'MCP session not found. Please connect to a server first.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const modelConfig = await getModelConfigById(modelId);
        if (!modelConfig) {
            return new Response(
                JSON.stringify({ error: `Model not found: ${modelId}` }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get MCP tools and convert to OpenAI function format
        let mcpTools: ToolDefinition[] = [];
        try {
            const toolsResult = await session.client.listTools();
            mcpTools = toolsResult.tools.map((tool) => ({
                name: tool.name,
                description: tool.description || '',
                parameters: tool.inputSchema as Record<string, unknown>,
            }));
        } catch (toolsError) {
            console.error('Failed to list MCP tools:', toolsError);
            return new Response(
                JSON.stringify({ error: 'Failed to get tools from MCP server' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const encoder = new TextEncoder();

        const readableStream = new ReadableStream({
            async start(controller) {
                const moduleType = 'mcp' as const;
                const send: SendFn = (event) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ...event, module: moduleType, timestamp: createTimestamp() })}\n\n`));
                };

                try {
                    // Build current conversation messages list (mutable, appended each round)
                    const messages: ChatMessage[] = inputMessages.map((m) => ({
                        role: m.role as 'user' | 'assistant',
                        content: m.content,
                    }));

                    let llmRequestCount = 0;
                    const MAX_ROUNDS = 3;

                    for (let round = 0; round < MAX_ROUNDS; round++) {
                        llmRequestCount++;

                        let textAccumulated = '';
                        let toolCallCompleteData: StreamToolCallCompleteData | null = null;
                        let doneData: StreamDoneData | null = null;
                        let hasToolCall = false;

                        // Call chatCompletionStream with MCP tools
                        for await (const event of chatCompletionStream({
                            model: modelConfig,
                            messages,
                            tools: mcpTools,
                        })) {
                            if (event.type === 'request') {
                                const reqData = event.data as StreamRequestData;
                                send({
                                    type: 'llm_request',
                                    round: llmRequestCount,
                                    request: reqData.request,
                                });
                            } else if (event.type === 'chunk') {
                                const chunkData = event.data as { chunk: { parsed: unknown } };
                                const parsed = chunkData.chunk?.parsed as {
                                    choices?: Array<{ delta?: { content?: string } }>;
                                } | null;
                                const delta = parsed?.choices?.[0]?.delta?.content;
                                if (delta) {
                                    textAccumulated += delta;
                                    send({ type: 'chunk', delta });
                                }
                            } else if (event.type === 'tool_call_complete') {
                                toolCallCompleteData = event.data as StreamToolCallCompleteData;
                                hasToolCall = true;
                            } else if (event.type === 'done') {
                                doneData = event.data as StreamDoneData;
                            } else if (event.type === 'error') {
                                const errData = event.data as { error: string };
                                send({ type: 'error', error: errData.error });
                                controller.close();
                                return;
                            }
                        }

                        // Process this round
                        if (hasToolCall && toolCallCompleteData) {
                            // 将tool_call消息发送给前端显示
                            send({
                                type: 'llm_response',
                                round: llmRequestCount,
                                response: {
                                    finish_reason: 'tool_calls',
                                    content: textAccumulated || undefined,
                                    tool_calls: toolCallCompleteData.tool_calls,
                                },
                            });

                            // 添加tool_call消息放入上下文
                            messages.push({
                                role: 'assistant',
                                content: textAccumulated || '',
                                tool_calls: toolCallCompleteData.tool_calls,
                            });

                            // 获取tool_call的内容，遍历tools，并执行
                            const toolCalls = toolCallCompleteData.tool_calls;
                            for (const tc of toolCalls) {
                                const toolName = tc.function.name;
                                let argsObj: Record<string, unknown> = {};
                                try {
                                    argsObj = JSON.parse(tc.function.arguments || '{}');
                                } catch {
                                    argsObj = {};
                                }

                                // 发送消息给前端显示
                                send({ type: 'tool_call', toolName, args: argsObj });

                                // 执行remote mcp 调用
                                let result: unknown;
                                try {
                                    const callResult = await session.client.callTool({
                                        name: toolName,
                                        arguments: argsObj,
                                    });
                                    result = callResult;
                                } catch (callError) {
                                    result = `Error: ${callError instanceof Error ? callError.message : 'Unknown error'}`;
                                }

                                // 发送tool_call结果给前端
                                send({ type: 'tool_result', toolName, result });

                                // 将tool_call结果放入消息上下文
                                messages.push({
                                    role: 'tool',
                                    content: typeof result === 'string' ? result : JSON.stringify(result),
                                    tool_call_id: tc.id,
                                    name: toolName,
                                });
                            }
                            continue;
                        }
                        send({
                            type: 'llm_response',
                            round: llmRequestCount,
                            response: {
                                finish_reason: doneData?.finish_reason || 'stop',
                                content: textAccumulated || undefined,
                                tool_calls: undefined,
                                usage: doneData?.usage,
                            },
                        });
                        break;
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`)
                    );
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
