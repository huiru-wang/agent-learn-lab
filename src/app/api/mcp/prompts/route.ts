import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/mcp-protocol/lib/mcp-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, method, name, arguments: args = {} } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (method === 'listPrompts' || (!method && !name)) {
      const result = await session.client.listPrompts();
      return NextResponse.json({ prompts: result.prompts });
    }

    if (method === 'getPrompt' || name) {
      if (!name) {
        return NextResponse.json({ error: 'name is required for getPrompt' }, { status: 400 });
      }

      const prompt = await session.client.getPrompt({
        name,
        arguments: args,
      });

      return NextResponse.json({ prompt });
    }

    return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
  } catch (error) {
    console.error('MCP prompts error:', error);
    const message = error instanceof Error ? error.message : 'Prompt operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
