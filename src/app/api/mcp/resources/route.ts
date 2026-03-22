import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/mcp-protocol/lib/mcp-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, method, uri } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (method === 'listResources' || (!method && !uri)) {
      const result = await session.client.listResources();
      return NextResponse.json({ resources: result.resources });
    }

    if (method === 'readResource' || uri) {
      if (!uri) {
        return NextResponse.json({ error: 'uri is required for readResource' }, { status: 400 });
      }

      const contents = await session.client.readResource({ uri });
      return NextResponse.json({ contents });
    }

    return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
  } catch (error) {
    console.error('MCP resources error:', error);
    const message = error instanceof Error ? error.message : 'Resource operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
