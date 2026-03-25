import { NextResponse } from 'next/server';
import { getMcpConfigs, BUILTIN_MCP_SERVERS } from '@/lib/config';

export async function GET() {
  const userServers = await getMcpConfigs();

  // 返回内置 MCP 列表（不含敏感 URL）和用户 MCP 列表
  const builtins = BUILTIN_MCP_SERVERS.map((s) => ({
    name: s.name,
  }));

  return NextResponse.json({
    builtins,
    servers: userServers,
  });
}
