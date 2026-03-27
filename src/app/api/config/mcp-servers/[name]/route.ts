import { NextResponse } from 'next/server';
import { getBuiltinMcpConfigs } from '@/lib/config';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const builtinServers = await getBuiltinMcpConfigs();
  const server = builtinServers.find((s) => s.name === decodedName);

  if (!server) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    name: server.name,
    serverUrl: server.serverUrl,
    authHeader: server.authHeader,
  });
}
