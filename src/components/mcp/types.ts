// MCP Server 类型
export interface MCPServer {
  id: string;
  name: string;
  serverUrl?: string;    // 内置 MCP 为空，连接时获取
  authHeader?: string;
  isBuiltin: boolean;
}

// MCP Tool 类型
export interface MCPTool {
  name: string;
  serverName: string;    // 所属服务器名称
  description?: string;
  inputSchema: unknown;
}

// 带工具的服务器状态
export interface MCPServerWithTools {
  server: MCPServer;
  tools: MCPTool[];
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
}
