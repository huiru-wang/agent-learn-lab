import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/app/mcp-protocol/lib/mcp-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverUrl, authHeader } = body;

    if (!serverUrl) {
      return NextResponse.json({ error: 'serverUrl is required' }, { status: 400 });
    }

    const { sessionId, client } = await createSession(serverUrl, authHeader);

    // Try to list tools to verify connection
    try {
      await client.listTools();
    } catch (e) {
      // Connection might still be valid even if listTools fails
      console.error('listTools failed during connect:', e);
    }

    return NextResponse.json({ sessionId, success: true });
  } catch (error) {
    console.error('MCP connect error:', error);
    const message = error instanceof Error ? error.message : 'Connection failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
