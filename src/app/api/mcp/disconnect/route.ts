import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/app/mcp-protocol/lib/mcp-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    await deleteSession(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MCP disconnect error:', error);
    const message = error instanceof Error ? error.message : 'Disconnect failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
