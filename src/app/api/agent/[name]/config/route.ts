import { NextRequest, NextResponse } from 'next/server';
import {
  getAgentConfig,
  getAllowedModelsForAgent,
  getBuiltinMcpConfigs,
  getMcpConfigs,
  getAgentTools,
} from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    // 获取 agent 配置
    const agentConfig = await getAgentConfig(name);
    if (!agentConfig) {
      return NextResponse.json(
        { error: `Agent "${name}" not found` },
        { status: 404 }
      );
    }

    // 获取允许的模型
    const models = await getAllowedModelsForAgent(name);
    const safeModels = models.map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      model: m.model,
    }));

    // 获取工具配置
    const toolsConfig = await getAgentTools(name);

    // 获取 MCP 服务器配置（只返回该 agent 允许的）
    const allowedMcpNames = Object.keys(agentConfig.mcps || {});
    const builtinServers = await getBuiltinMcpConfigs();
    const userServers = await getMcpConfigs();

    const mcps: Record<string, {
      name: string;
      serverUrl?: string;
      authHeader?: string;
      tools: string[];
    }> = {};

    for (const mcpName of allowedMcpNames) {
      const builtin = builtinServers.find((s) => s.name === mcpName);
      const user = userServers.find((s) => s.name === mcpName);

      if (builtin || user) {
        const server = builtin || user;
        mcps[mcpName] = {
          name: mcpName,
          serverUrl: server?.serverUrl,
          authHeader: server?.authHeader,
          tools: toolsConfig.mcpTools[mcpName] || [],
        };
      }
    }

    return NextResponse.json({
      agent: {
        name: agentConfig.name,
        description: agentConfig.description,
      },
      models: safeModels,
      localTools: toolsConfig.localTools,
      mcps,
    });
  } catch (error) {
    console.error('[Agent Config]', error);
    return NextResponse.json(
      { error: 'Failed to load agent config' },
      { status: 500 }
    );
  }
}
