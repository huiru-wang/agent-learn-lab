// ── 共享工具类型定义 ────────────────────────────────────────────────
// 供所有 Agent 模块使用的通用工具类型

// OpenAI 函数调用格式兼容的工具定义
export interface ToolDefinition {
  name: string; // MCP 兼容: ^[A-Za-z0-9._-]{1,128}$
  description: string;
  parameters: Record<string, unknown>; // JSON Schema object
}

// 工具执行函数签名
export type ToolExecutor = (args: Record<string, unknown>) => string | Promise<string>;

// MCP 工具 (来自 @modelcontextprotocol/sdk)
export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: unknown;
}

// 将 MCP 工具转换为 ToolDefinition 格式
export function mcpToolToDefinition(tool: MCPTool): ToolDefinition {
  return {
    name: tool.name,
    description: tool.description || '',
    parameters: tool.inputSchema as Record<string, unknown>,
  };
}

// MCP 工具名称转换：使用下划线前缀避免命名冲突
// MCP 规范 (SEP-986) 不允许冒号 ':'，所以用下划线替代
export function mcpToolNameToLocal(
  toolName: string,
  serverName: string
): string {
  // 将 serverName 中的连字符替换为下划线，再拼接工具名
  const sanitizedServer = serverName.replace(/-/g, '_');
  return `${sanitizedServer}_${toolName}`;
}

// 解析本地工具名称，获取 MCP 服务器名和原始工具名
export function localToolNameToMCP(
  localName: string
): { serverName: string; toolName: string } | null {
  // 查找第一个下划线位置分割
  const firstUnderscore = localName.indexOf('_');
  if (firstUnderscore === -1) {
    return null;
  }
  const serverName = localName.substring(0, firstUnderscore).replace(/_/g, '-');
  const toolName = localName.substring(firstUnderscore + 1);
  return { serverName, toolName };
}
