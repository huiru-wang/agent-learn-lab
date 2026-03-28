import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getModelConfigById, validateModelForAgent } from '@/lib/config';
import {
  chatCompletionStream,
  type ChatMessage,
  type StreamRequestData,
  type StreamDoneData,
} from '@/lib/llm-client';
import type { IntentDef } from '@/lib/prompts';
import { buildSystemPrompt } from '@/lib/prompts';
import { createTimestamp } from '@/lib/chat-utils';

const RequestSchema = z.object({
  text: z.string().min(1, '输入文本不能为空'),
  model: z.string(),
  intents: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      description: z.string(),
      slots: z.array(
        z.object({
          name: z.string(),
          label: z.string(),
          type: z.string(),
          required: z.boolean(),
        })
      ),
    })
  ),
});

function parseJsonFromText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // continue
      }
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.slice(firstBrace, lastBrace + 1));
      } catch {
        // continue
      }
    }
    throw new Error('无法解析 LLM 返回的 JSON');
  }
}

type SendFn = (event: Record<string, unknown>) => void;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: '请求参数无效', details: parsed.error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { text, model: modelId, intents } = parsed.data;

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
        JSON.stringify({ error: `模型未找到: ${modelId}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = buildSystemPrompt(intents as IntentDef[]);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ];

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        const moduleType = 'intent' as const;
        const send: SendFn = (event) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ...event, module: moduleType, timestamp: createTimestamp() })}\n\n`));
        };

        try {
          let contentAccumulated = '';
          let reasoningAccumulated = '';
          let doneData: StreamDoneData | null = null;

          for await (const event of chatCompletionStream({
            model: modelConfig,
            messages,
            temperature: 0.1,
            enableThinking: true,
          })) {
            if (event.type === 'request') {
              const reqData = event.data as StreamRequestData;
              send({ type: 'request', request: reqData.request });
            } else if (event.type === 'chunk') {
              const chunkData = event.data as { chunk: { parsed: unknown } };
              const parsed = chunkData.chunk?.parsed as {
                choices?: Array<{
                  delta?: {
                    content?: string;
                    reasoning_content?: string;
                  };
                }>;
              } | null;

              const delta = parsed?.choices?.[0]?.delta;

              if (delta?.reasoning_content) {
                reasoningAccumulated += delta.reasoning_content;
                send({ type: 'reasoning_delta', delta: delta.reasoning_content });
              }

              if (delta?.content) {
                contentAccumulated += delta.content;
                send({ type: 'content_delta', delta: delta.content });
              }
            } else if (event.type === 'done') {
              doneData = event.data as StreamDoneData;
            } else if (event.type === 'error') {
              const errData = event.data as { error: string };
              send({ type: 'error', error: errData.error });
              controller.close();
              return;
            }
          }

          // 流结束后，解析意图结果
          if (contentAccumulated) {
            try {
              const intentResult = parseJsonFromText(contentAccumulated);
              send({ type: 'intent_result', result: intentResult });
            } catch (parseError) {
              const msg = parseError instanceof Error ? parseError.message : '解析失败';
              send({ type: 'error', error: `意图结果解析失败: ${msg}` });
            }
          }

          // 发送完成事件
          send({
            type: 'done',
            usage: doneData?.usage,
            finish_reason: doneData?.finish_reason,
            reasoning: reasoningAccumulated || undefined,
          });
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
    const message = error instanceof Error ? error.message : '未知错误';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
