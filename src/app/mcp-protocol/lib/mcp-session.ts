import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export interface MCPSession {
  id: string;  // sessionId
  client: Client;
  transport: StreamableHTTPClientTransport;
  serverUrl: string;
  createdAt: number;
}

// Global session store
const sessions = new Map<string, MCPSession>();

export function createSessionId(): string {
  return `mcp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function createSession(
  serverUrl: string,
  authHeader?: string
): Promise<{ sessionId: string; client: Client }> {
  const sessionId = createSessionId();

  const url = new URL(serverUrl);
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: authHeader
      ? { headers: { Authorization: authHeader } }
      : undefined,
  });

  const client = new Client(
    { name: 'agent-learn-lab', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);

  sessions.set(sessionId, {
    id: sessionId,
    client,
    transport,
    serverUrl,
    createdAt: Date.now(),
  });

  return { sessionId, client };
}

export function getSession(sessionId: string): MCPSession | undefined {
  return sessions.get(sessionId);
}

// Find session by serverUrl
export function getSessionByServerUrl(serverUrl: string): MCPSession | undefined {
  for (const session of sessions.values()) {
    if (session.serverUrl === serverUrl) {
      return session;
    }
  }
  return undefined;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const session = sessions.get(sessionId);
  if (session) {
    await session.client.close();
    sessions.delete(sessionId);
  }
}

export function listSessions(): string[] {
  return Array.from(sessions.keys());
}
