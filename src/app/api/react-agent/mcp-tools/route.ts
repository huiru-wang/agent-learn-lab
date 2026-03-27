import { NextResponse } from 'next/server';
import { getBuiltinMcpConfigs, getMcpConfigs } from '@/lib/config';
import { connectToMCPServer } from '@/lib/react-mcp';

export async function GET() {
  try {
    const result: {
      builtins: { name: string; serverUrl: string }[];
      servers: { name: string; serverUrl: string }[];
      tools: Record<string, Array<{ name: string; description?: string; inputSchema: unknown }>>;
    } = {
      builtins: [],
      servers: [],
      tools: {},
    };

    // 获取内置 MCP 服务器
    const builtinServers = await getBuiltinMcpConfigs();
    for (const server of builtinServers) {
      result.builtins.push({
        name: server.name,
        serverUrl: server.serverUrl,
      });
    }

    // 获取用户配置的 MCP 服务器
    const userServers = await getMcpConfigs();
    for (const server of userServers) {
      result.servers.push({
        name: server.name,
        serverUrl: server.serverUrl,
      });
    }

    // 尝试连接所有服务器并获取工具列表
    const allServers = [
      ...builtinServers.map((s) => ({ name: s.name, serverUrl: s.serverUrl, authHeader: s.authHeader })),
      ...userServers.map((s) => ({ name: s.name, serverUrl: s.serverUrl, authHeader: s.authHeader })),
    ];

    for (const server of allServers) {
      try {
        const { tools } = await connectToMCPServer(server);
        result.tools[server.name] = tools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        }));
      } catch (error) {
        console.error(`Failed to connect to MCP server ${server.name}:`, error);
        result.tools[server.name] = [];
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get MCP tools:', error);
    return NextResponse.json(
      { error: 'Failed to get MCP tools' },
      { status: 500 }
    );
  }
}
