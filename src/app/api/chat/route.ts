import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getModelConfigById } from '@/lib/config';
import {
  chatCompletion,
  chatCompletionStream,
  type ChatMessage,
} from '@/lib/llm-client';

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(32000).optional(),
  topP: z.number().min(0).max(1).optional(),
  stream: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { messages, model: modelId, temperature, maxTokens, topP, stream } = parsed.data;

    const modelConfig = await getModelConfigById(modelId);
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Model not found: ${modelId}` },
        { status: 400 }
      );
    }

    const chatMessages: ChatMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    if (stream) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of chatCompletionStream({
              model: modelConfig,
              messages: chatMessages,
              temperature,
              maxTokens,
              topP,
            })) {
              const data = JSON.stringify(event);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            controller.close();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorEvent = {
              type: 'error',
              data: { error: errorMessage },
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
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
    } else {
      const result = await chatCompletion({
        model: modelConfig,
        messages: chatMessages,
        temperature,
        maxTokens,
        topP,
        stream: false,
      });

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
