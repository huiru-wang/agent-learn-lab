import { promises as fs } from 'fs';
import path from 'path';

// ── 模型配置 ────────────────────────────────────────────────────

export interface ModelConfig {
    id: string;
    name: string;
    provider: string;
    baseUrl: string;
    apiKey: string;
    model: string;
}

// ── MCP 服务器配置 ────────────────────────────────────────────────

export interface McpServerConfig {
    name: string;
    serverUrl: string;
    authHeader?: string;
}

// 内置 MCP Servers
export interface BuiltinMcpServer {
    name: string;
    serverUrl: string;
    authHeader?: string;
}

// ── Agent 配置 ──────────────────────────────────────────────────

export interface AgentConfig {
    name: string;
    description: string;
    models: string[];  // 允许的模型 ID 列表
    tools: string[];   // 本地工具名
    mcps: Record<string, { tools: string[] }>;  // MCP 服务器及其可用工具
}

export interface AgentToolsResult {
    localTools: string[];
    mcpTools: Record<string, string[]>;
}

// ── 配置文件结构 ────────────────────────────────────────────────

interface AgentConfigFile {
    models: ModelConfig[];
    mcps: Record<string, { url: string; authHeader?: string }>;
    agents: Record<string, AgentConfig>;
    // 兼容旧格式
    mcpServers?: McpServerConfig[];
    builtinMcpServers?: BuiltinMcpServer[];
    mcp?: Record<string, { url: string; authHeader?: string }>;
}

let cachedConfig: AgentConfigFile | null = null;

async function loadConfig(): Promise<AgentConfigFile> {
    if (cachedConfig) {
        return cachedConfig;
    }

    try {
        const configPath = path.join(process.cwd(), 'agent.config.json');
        const content = await fs.readFile(configPath, 'utf-8');
        cachedConfig = JSON.parse(content);
        return cachedConfig!;
    } catch {
        console.warn('agent.config.json not found, using empty config');
        return { models: [], mcps: {}, agents: {} };
    }
}

// ── 模型相关函数 ────────────────────────────────────────────────

export async function getModelConfigs(): Promise<ModelConfig[]> {
    const config = await loadConfig();
    return config.models;
}

export async function getModelConfigById(id: string): Promise<ModelConfig | undefined> {
    const models = await getModelConfigs();
    return models.find((m) => m.id === id);
}

// ── MCP 服务器相关函数 ───────────────────────────────────────────

export async function getMcpConfigs(): Promise<McpServerConfig[]> {
    const config = await loadConfig();
    return config.mcpServers || [];
}

export async function getBuiltinMcpConfigs(): Promise<BuiltinMcpServer[]> {
    const config = await loadConfig();

    // 优先使用新的 mcps 格式
    if (config.mcps && Object.keys(config.mcps).length > 0) {
        return Object.entries(config.mcps).map(([name, server]) => ({
            name,
            serverUrl: server.url,
            authHeader: server.authHeader,
        }));
    }

    // 兼容旧的 mcp 格式
    if (config.mcp && Object.keys(config.mcp).length > 0) {
        return Object.entries(config.mcp).map(([name, server]) => ({
            name,
            serverUrl: server.url,
            authHeader: server.authHeader,
        }));
    }

    return config.builtinMcpServers || [];
}

// ── Agent 相关函数 ──────────────────────────────────────────────

/**
 * 获取指定 Agent 的配置
 */
export async function getAgentConfig(agentName: string): Promise<AgentConfig | undefined> {
    const config = await loadConfig();
    return config.agents[agentName];
}

/**
 * 获取主 Agent 配置（便捷函数）
 */
export async function getMainAgentConfig(): Promise<AgentConfig | undefined> {
    return getAgentConfig('main');
}

/**
 * 验证模型是否在 Agent 允许列表中
 */
export async function validateModelForAgent(agentName: string, modelId: string): Promise<boolean> {
    const agentConfig = await getAgentConfig(agentName);
    if (!agentConfig) {
        return false;
    }
    return agentConfig.models.includes(modelId);
}

/**
 * 获取 Agent 允许的工具列表
 */
export async function getAgentTools(agentName: string): Promise<AgentToolsResult> {
    const agentConfig = await getAgentConfig(agentName);
    if (!agentConfig) {
        return { localTools: [], mcpTools: {} };
    }
    // 转换 mcps 格式：{ serverName: { tools: [...] } } => { serverName: [...] }
    const mcpTools: Record<string, string[]> = {};
    for (const [serverName, serverConfig] of Object.entries(agentConfig.mcps || {})) {
        mcpTools[serverName] = serverConfig.tools || [];
    }

    return {
        localTools: agentConfig.tools || [],
        mcpTools,
    };
}

/**
 * 获取 Agent 允许的模型列表（用于前端）
 */
export async function getAllowedModelsForAgent(agentName: string): Promise<ModelConfig[]> {
    const agentConfig = await getAgentConfig(agentName);
    if (!agentConfig) {
        return [];
    }
    const allModels = await getModelConfigs();
    return allModels.filter((m) => agentConfig.models.includes(m.id));
}

/**
 * 获取主 Agent 允许的模型列表（便捷函数）
 */
export async function getMainAgentModels(): Promise<ModelConfig[]> {
    return getAllowedModelsForAgent('main');
}

// ── 凭证相关函数 ────────────────────────────────────────────────

export function getApiKeyWithEnvFallback(config: ModelConfig): string {
    if (config.apiKey) {
        return config.apiKey;
    }

    const envKey = `${config.provider.toUpperCase()}_API_KEY`;
    return process.env[envKey] || '';
}

export function getBaseUrlWithEnvFallback(config: ModelConfig): string | undefined {
    if (config.baseUrl) {
        return config.baseUrl;
    }

    const envKey = `${config.provider.toUpperCase()}_BASE_URL`;
    return process.env[envKey] || undefined;
}
