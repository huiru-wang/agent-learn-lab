import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { getBuiltinMcpConfigs } from './config';

export interface MCPServerInfo {
  name: string;
  serverUrl: string;
  authHeader?: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: unknown;
}

export interface MCPToolCallResult {
  success: boolean;
  result?: unknown;
  error?: string;
}

// MCP Session cache
const sessions = new Map<string, { client: Client; serverUrl: string }>();

/**
 * 获取 MCP 服务器连接信息
 * @param name 服务器名称
 * @param userServers 用户配置的服务器（可选）
 */
export async function getMCPServerInfo(
  name: string,
  userServers?: MCPServerInfo[]
): Promise<MCPServerInfo | undefined> {
  // 先查找内置服务器
  const builtins = await getBuiltinMcpConfigs();
  const builtin = builtins.find((s) => s.name === name);
  if (builtin) {
    return {
      name: builtin.name,
      serverUrl: builtin.serverUrl,
      authHeader: builtin.authHeader,
    };
  }

  // 再查找用户服务器
  if (userServers) {
    const user = userServers.find((s) => s.name === name);
    if (user) {
      return user;
    }
  }

  return undefined;
}

/**
 * 连接到 MCP 服务器并获取工具列表
 */
export async function connectToMCPServer(
  serverInfo: MCPServerInfo
): Promise<{ sessionId: string; tools: MCPTool[] }> {
  const existingSession = sessions.get(serverInfo.serverUrl);
  if (existingSession) {
    // 复用已有 session
    const tools = await existingSession.client.listTools();
    return {
      sessionId: serverInfo.serverUrl,
      tools: tools.tools as MCPTool[],
    };
  }

  const url = new URL(serverInfo.serverUrl);
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: serverInfo.authHeader
      ? { headers: { Authorization: serverInfo.authHeader } }
      : undefined,
  });

  const client = new Client(
    { name: 'agent-learn-lab-react', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);

  sessions.set(serverInfo.serverUrl, { client, serverUrl: serverInfo.serverUrl });

  const tools = await client.listTools();
  return {
    sessionId: serverInfo.serverUrl,
    tools: tools.tools as MCPTool[],
  };
}

/**
 * 调用 MCP 工具
 */
export async function callMCPTool(
  sessionId: string,
  toolName: string,
  arguments_: Record<string, unknown>
): Promise<MCPToolCallResult> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  try {
    const result = await session.client.callTool({
      name: toolName,
      arguments: arguments_,
    });
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Tool call failed',
    };
  }
}

/**
 * 关闭 MCP 服务器连接
 */
export async function disconnectMCPServer(serverUrl: string): Promise<void> {
  const session = sessions.get(serverUrl);
  if (session) {
    await session.client.close();
    sessions.delete(serverUrl);
  }
}

/**
 * 关闭所有 MCP 连接
 */
export async function disconnectAllMCPServers(): Promise<void> {
  for (const [url, session] of sessions) {
    await session.client.close();
    sessions.delete(url);
  }
}
