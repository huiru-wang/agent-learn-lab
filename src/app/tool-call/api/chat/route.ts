import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getModelConfigById, validateModelForAgent } from '@/lib/config';
import {
  chatCompletionStream,
  type ChatMessage,
  type StreamToolCallCompleteData,
  type StreamDoneData,
  type StreamRequestData,
} from '@/lib/llm-client';
import { allToolDefinitions, toolExecutors } from '../../lib/tool-registry';
import { createTimestamp } from '@/lib/chat-utils';

const RequestSchema = z.object({
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

    const { messages: inputMessages, model: modelId } = parsed.data;

    // 验证模型是否在 main agent 允许列表中
    const isAllowed = await validateModelForAgent('main', modelId);
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: `Model "${modelId}" is not allowed. Please use a model from the main agent configuration.` }),
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

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        const moduleType = 'tool-call' as const;
        const send: SendFn = (event) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ...event, module: moduleType, timestamp: createTimestamp() })}\n\n`));
        };

        try {
          // 构建当前对话消息列表（可变，每轮追加）
          const messages: ChatMessage[] = inputMessages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

          let llmRequestCount = 0; // 第几次 LLM 请求（用于前端绑定 step）
          const MAX_ROUNDS = 3;

          for (let round = 0; round < MAX_ROUNDS; round++) {
            // 1. 通知前端本轮 LLM 请求即将发送
            llmRequestCount++;

            let textAccumulated = '';
            let toolCallCompleteData: StreamToolCallCompleteData | null = null;
            let doneData: StreamDoneData | null = null;
            let hasToolCall = false;

            // 2. 调用 chatCompletionStream
            for await (const event of chatCompletionStream({
              model: modelConfig,
              messages,
              tools: allToolDefinitions,
            })) {
              if (event.type === 'request') {
                // 推送 llm_request 事件（含完整 request body，API Key 已脱敏）
                const reqData = event.data as StreamRequestData;
                send({
                  type: 'llm_request',
                  round: llmRequestCount,
                  request: reqData.request,
                });
              } else if (event.type === 'chunk') {
                // 提取文字 delta
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

            // 3. 本轮结束后处理
            if (hasToolCall && toolCallCompleteData) {
              // 发送 llm_response（含 finish_reason=tool_calls 和 tool_calls 对象）
              send({
                type: 'llm_response',
                round: llmRequestCount,
                response: {
                  finish_reason: 'tool_calls',
                  content: textAccumulated || undefined,
                  tool_calls: toolCallCompleteData.tool_calls,
                },
              });

              // finish_reason = tool_calls → 执行工具，继续下一轮
              const toolCalls = toolCallCompleteData.tool_calls;

              // 追加 assistant 消息（含 tool_calls）
              messages.push({
                role: 'assistant',
                content: textAccumulated || '',
                tool_calls: toolCalls,
              });

              // 逐个执行工具并追加 tool 消息
              for (const tc of toolCalls) {
                const toolName = tc.function.name;
                let argsObj: Record<string, unknown> = {};
                try {
                  argsObj = JSON.parse(tc.function.arguments || '{}');
                } catch {
                  argsObj = {};
                }

                // 推送 tool_call 事件
                send({ type: 'tool_call', toolName, args: argsObj });

                // 执行工具
                const executor = toolExecutors[toolName];
                const result = executor ? executor(argsObj) : `Unknown tool: ${toolName}`;

                // 推送 tool_result
                send({ type: 'tool_result', toolName, result });

                // 追加 tool 角色消息
                messages.push({
                  role: 'tool',
                  content: result,
                  tool_call_id: tc.id,
                  name: toolName,
                });
              }

              // 继续下一轮
              continue;
            }

            // finish_reason = stop（或其他）→ 发送 llm_response 后结束
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
