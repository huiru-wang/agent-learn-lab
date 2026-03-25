// ── MCP 客户端工厂 ─────────────────────────────────────────────────
// 共享的 MCP 连接管理，供所有 Agent 模块使用

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { MCPTool } from './tool-types';

export interface MCPServerConfig {
  name: string;
  url: string;
  authHeader?: string;
}

export interface MCPClientSession {
  client: Client;
  serverName: string;
  tools: MCPTool[];
}

export interface MCPConnectionResult {
  sessionId: string;
  session: MCPClientSession;
}

// Global session store (独立于 mcp-protocol 模块的自有会话管理)
const sessions = new Map<string, MCPClientSession>();

function createSessionId(): string {
  return `mcp_shared_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 创建 MCP 客户端连接
export async function createMCPClient(config: MCPServerConfig): Promise<MCPConnectionResult> {
  const sessionId = createSessionId();

  const url = new URL(config.url);
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: config.authHeader
      ? { headers: { Authorization: config.authHeader } }
      : undefined,
  });

  const client = new Client(
    { name: 'agent-learn-lab', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);

  // 获取工具列表
  let tools: MCPTool[] = [];
  try {
    const toolsResult = await client.listTools();
    tools = toolsResult.tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
  } catch {
    // 工具列表获取失败不影响连接
    console.warn(`Failed to list tools for server ${config.name}:`,);
  }

  const session: MCPClientSession = {
    client,
    serverName: config.name,
    tools,
  };

  sessions.set(sessionId, session);

  return { sessionId, session };
}

// 获取会话
export function getMCPSession(sessionId: string): MCPClientSession | undefined {
  return sessions.get(sessionId);
}

// 关闭会话
export async function closeMCPSession(sessionId: string): Promise<void> {
  const session = sessions.get(sessionId);
  if (session) {
    await session.client.close();
    sessions.delete(sessionId);
  }
}

// 列出所有会话 ID
export function listMCPSessions(): string[] {
  return Array.from(sessions.keys());
}
