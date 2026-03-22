import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getModelConfigById } from '@/lib/config';
import {
  chatCompletionStream,
  type ChatMessage,
  type StreamRequestData,
  type StreamDoneData,
} from '@/lib/llm-client';
import type { IntentDef } from '../../lib/intent-registry';

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

function buildSystemPrompt(intents: IntentDef[]): string {
  const intentDescriptions = intents
    .map((intent) => {
      const slotDescriptions = intent.slots
        .map(
          (slot) =>
            `    - ${slot.name} (${slot.label}): 类型=${slot.type}, ${slot.required ? '必填' : '可选'}`
        )
        .join('\n');
      return `  - ${intent.name} (${intent.label}): ${intent.description}\n    槽位:\n${slotDescriptions}`;
    })
    .join('\n');

  return `你是一个专业的意图识别系统。给定用户的自然语言输入，你需要从预定义的意图列表中进行分类，并提取相关槽位信息。

## 预定义意图列表

${intentDescriptions}

## 任务要求

1. **意图分类**: 分析用户输入，判断其最匹配的意图，并为所有预定义意图给出置信度评分（0到1之间的小数，所有意图的置信度之和应大致为1）
2. **槽位提取**: 从用户输入中提取与主意图相关的槽位值
3. **槽位归一化**: 如果槽位值可以标准化（如相对日期"明天"、"后天"转为具体日期），在 normalized 字段中提供标准化值。今天的日期是 ${new Date().toISOString().split('T')[0]}
4. **推理说明**: 简要说明你的分类推理过程

## 输出格式

请严格按照以下 JSON 格式返回结果，不要包含其他内容：

\`\`\`json
{
  "primaryIntent": {
    "name": "意图名称",
    "label": "意图中文标签",
    "confidence": 0.92
  },
  "slots": [
    {
      "name": "槽位名称",
      "label": "槽位中文标签",
      "value": "原始提取值",
      "normalized": "归一化值（如无则省略此字段）"
    }
  ],
  "allIntents": [
    {
      "name": "意图名称",
      "label": "意图中文标签",
      "confidence": 0.92
    }
  ],
  "reasoning": "推理过程说明"
}
\`\`\`

注意事项：
- allIntents 数组应包含所有预定义意图，按置信度降序排列
- 置信度应该是合理的，最匹配的意图置信度最高
- 如果用户输入不太匹配任何预定义意图，所有意图的置信度都应较低
- slots 只提取与主意图相关的槽位
- 只返回 JSON，不要有其他文字`;
}

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
        const send: SendFn = (event) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
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
