import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/mcp-protocol/lib/mcp-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, method, toolName, arguments: args = {} } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Handle different tool methods
    if (method === 'listTools' || (!method && !toolName)) {
      const result = await session.client.listTools();
      // result is { tools: [...], nextCursor?, _meta? }
      return NextResponse.json({ tools: result.tools });
    }

    if (method === 'callTool' || toolName) {
      if (!toolName) {
        return NextResponse.json({ error: 'toolName is required for callTool' }, { status: 400 });
      }

      const result = await session.client.callTool({
        name: toolName,
        arguments: args,
      });

      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
  } catch (error) {
    console.error('MCP tools error:', error);
    const message = error instanceof Error ? error.message : 'Tool operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
