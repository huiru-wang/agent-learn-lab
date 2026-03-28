import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/app/mcp-protocol/lib/mcp-session';
import { getBuiltinMcpConfigs, getMcpConfigs, getMainAgentConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, serverUrl, authHeader } = body;

    // 方式 A: 只传 name（连接内置 MCP）
    if (name && !serverUrl) {
      const mainAgent = await getMainAgentConfig();
      const allowedMcpNames = mainAgent ? Object.keys(mainAgent.mcps || {}) : [];

      if (!allowedMcpNames.includes(name)) {
        return NextResponse.json({ error: 'MCP server not allowed' }, { status: 403 });
      }

      // 从配置中查找 server
      const builtinServers = await getBuiltinMcpConfigs();
      const userServers = await getMcpConfigs();
      const allServers = [...builtinServers, ...userServers];
      const server = allServers.find((s) => s.name === name);

      if (!server) {
        return NextResponse.json({ error: 'Server not found' }, { status: 404 });
      }

      // 创建 session
      const { sessionId, client } = await createSession(server.serverUrl, server.authHeader);

      // 验证连接
      try {
        await client.listTools();
      } catch (e) {
        console.error('listTools failed during connect:', e);
      }

      return NextResponse.json({ sessionId, success: true });
    }

    // 方式 B: 传 serverUrl（用户自定义 MCP，保持向后兼容）
    if (serverUrl) {
      const { sessionId, client } = await createSession(serverUrl, authHeader);

      try {
        await client.listTools();
      } catch (e) {
        console.error('listTools failed during connect:', e);
      }

      return NextResponse.json({ sessionId, success: true });
    }

    return NextResponse.json({ error: 'name or serverUrl required' }, { status: 400 });
  } catch (error) {
    console.error('MCP connect error:', error);
    const message = error instanceof Error ? error.message : 'Connection failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
