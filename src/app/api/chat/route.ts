import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { getModel, getModelConfigById } from '@/lib/llm-client';
import { z } from 'zod';

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

    const { messages, model, temperature, maxTokens, topP } = parsed.data;

    const modelConfig = await getModelConfigById(model);
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Model not found: ${model}` },
        { status: 400 }
      );
    }

    const languageModel = await getModel(model);

    const result = streamText({
      model: languageModel,
      messages,
      temperature,
      maxOutputTokens: maxTokens,
      topP,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
