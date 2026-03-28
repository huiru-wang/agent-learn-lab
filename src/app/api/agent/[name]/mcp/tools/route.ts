import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/mcp-protocol/lib/mcp-session';
import {
  getBuiltinMcpConfigs,
  getAgentConfig,
} from '@/lib/config';

/**
 * 根据 session.serverUrl 查找对应的 serverName
 */
async function findServerNameByUrl(serverUrl: string): Promise<string | null> {
  const builtinServers = await getBuiltinMcpConfigs();
  const server = builtinServers.find((s) => s.serverUrl === serverUrl);
  return server?.name ?? null;
}

/**
 * 根据 agent 配置过滤工具列表
 */
async function filterToolsByAgentConfig(
  tools: any[],
  session: { serverUrl: string },
  agentName: string
): Promise<any[]> {
  // 1. 从 session.serverUrl 查找 serverName
  const serverName = await findServerNameByUrl(session.serverUrl);
  if (!serverName) return tools;

  // 2. 获取 agent 允许的工具列表
  const agentConfig = await getAgentConfig(agentName);
  const allowedTools = agentConfig?.mcps?.[serverName]?.tools;
  if (!allowedTools || allowedTools.length === 0) return tools;

  // 3. 过滤
  return tools.filter((tool: any) => allowedTools.includes(tool.name));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: agentName } = await params;
    const body = await request.json();
    const { sessionId, method, toolName, arguments: args = {} } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Handle listTools
    if (method === 'listTools' || (!method && !toolName)) {
      const result = await session.client.listTools();
      // 根据 agent 配置过滤工具
      const filteredTools = await filterToolsByAgentConfig(result.tools, session, agentName);
      return NextResponse.json({ tools: filteredTools });
    }

    // Handle callTool
    if (method === 'callTool' || toolName) {
      if (!toolName) {
        return NextResponse.json({ error: 'toolName is required for callTool' }, { status: 400 });
      }

      // 检查工具是否在允许列表中
      const serverName = await findServerNameByUrl(session.serverUrl);
      if (serverName) {
        const agentConfig = await getAgentConfig(agentName);
        const allowedTools = agentConfig?.mcps?.[serverName]?.tools;
        if (allowedTools && !allowedTools.includes(toolName)) {
          return NextResponse.json(
            { error: `Tool "${toolName}" is not allowed for this agent` },
            { status: 403 }
          );
        }
      }

      const result = await session.client.callTool({
        name: toolName,
        arguments: args,
      });

      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
  } catch (error) {
    console.error('[Agent MCP Tools]', error);
    const message = error instanceof Error ? error.message : 'Tool operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
