import { NextResponse } from 'next/server';
import { getAvailableModels } from '@/lib/llm-client';

export async function GET() {
  try {
    const models = await getAvailableModels();
    const safeModels = models.map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      model: m.model,
    }));
    return NextResponse.json({ models: safeModels });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load models' },
      { status: 500 }
    );
  }
}
