import { NextResponse } from 'next/server';
import { getMcpConfigs, getBuiltinMcpConfigs } from '@/lib/config';

export async function GET() {
  const userServers = await getMcpConfigs();

  // 返回内置 MCP 列表（不含敏感 URL）和用户 MCP 列表
  const builtinServers = await getBuiltinMcpConfigs();
  const builtins = builtinServers.map((s) => ({
    name: s.name,
  }));

  return NextResponse.json({
    builtins,
    servers: userServers,
  });
}
