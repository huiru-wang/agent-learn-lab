'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MCPServerContext, type MCPServerProviderProps } from './MCPServerContext';
import type { MCPServer, MCPTool, MCPServerWithTools } from './types';
import { getBuiltinMcpConfigs } from '@/lib/config';
import { connectToMCPServer, disconnectMCPServer } from '@/lib/react-mcp';

const STORAGE_KEY = 'mcp-user-servers';

// localStorage 存储的用户服务器类型（不含 id 和 isBuiltin）
interface StoredServer {
  name: string;
  serverUrl?: string;
  authHeader?: string;
}

/**
 * 获取用户服务器（从 localStorage）
 */
function getUserServers(): StoredServer[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * 保存用户服务器到 localStorage
 */
function saveUserServers(servers: StoredServer[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
  } catch {
    // ignore
  }
}

export function MCPServerProvider({ children, initialSelectedTools = [] }: MCPServerProviderProps) {
  const [servers, setServers] = useState<MCPServerWithTools[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>(initialSelectedTools);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  // 初始化：加载内置和用户服务器
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        // 获取内置服务器
        const builtins = await getBuiltinMcpConfigs();
        const builtinServers: MCPServerWithTools[] = builtins.map((b) => ({
          server: {
            id: `builtin_${b.name}`,
            name: b.name,
            serverUrl: b.serverUrl,
            authHeader: b.authHeader,
            isBuiltin: true,
          },
          tools: [],
          isConnected: false,
          isLoading: false,
        }));

        // 获取用户服务器
        const userServers = getUserServers();
        const userServersWithTools: MCPServerWithTools[] = userServers.map((s) => ({
          server: {
            id: `user_${s.name}_${Date.now()}`,
            name: s.name,
            serverUrl: s.serverUrl,
            authHeader: s.authHeader,
            isBuiltin: false,
          },
          tools: [],
          isConnected: false,
          isLoading: false,
        }));

        setServers([...builtinServers, ...userServersWithTools]);
      } catch (error) {
        console.error('Failed to init MCP servers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // 添加服务器
  const addServer = useCallback(async (server: Omit<MCPServer, 'id'>): Promise<string> => {
    const id = `user_${server.name}_${Date.now()}`;
    const newServer: MCPServerWithTools = {
      server: { ...server, id, isBuiltin: false },
      tools: [],
      isConnected: false,
      isLoading: false,
    };

    setServers((prev) => {
      // 检查是否已存在同名服务器
      if (prev.some((s) => s.server.name === server.name && !s.server.isBuiltin)) {
        return prev;
      }
      const updated = [...prev, newServer];
      // 保存到 localStorage
      saveUserServers(updated.filter((s) => !s.server.isBuiltin).map((s) => ({
        name: s.server.name,
        serverUrl: s.server.serverUrl,
        authHeader: s.server.authHeader,
      })));
      return updated;
    });

    // 添加后自动连接
    await connectServer(id);

    return id;
  }, []);

  // 移除服务器
  const removeServer = useCallback((id: string) => {
    setServers((prev) => {
      const server = prev.find((s) => s.server.id === id);
      if (!server || server.server.isBuiltin) return prev;

      const updated = prev.filter((s) => s.server.id !== id);
      // 保存到 localStorage
      saveUserServers(updated.filter((s) => !s.server.isBuiltin).map((s) => ({
        name: s.server.name,
        serverUrl: s.server.serverUrl,
        authHeader: s.server.authHeader,
      })));
      // 清除选中
      setSelectedTools((tools) => tools.filter((t) => !t.startsWith(`${id}:`)));
      return updated;
    });
  }, []);

  // 连接服务器
  const connectServer = useCallback(async (id: string) => {
    setServers((prev) =>
      prev.map((s) =>
        s.server.id === id ? { ...s, isLoading: true, error: undefined } : s
      )
    );

    try {
      const server = servers.find((s) => s.server.id === id);
      if (!server) return;

      let serverUrl = server.server.serverUrl;
      let authHeader = server.server.authHeader;

      // 内置服务器需要先获取 URL
      if (server.server.isBuiltin && !serverUrl) {
        const res = await fetch(`/api/config/mcp-servers/${encodeURIComponent(server.server.name)}`);
        if (res.ok) {
          const info = await res.json();
          serverUrl = info.serverUrl;
          authHeader = info.authHeader;
        } else {
          throw new Error('Failed to get server URL');
        }
      }

      if (!serverUrl) {
        throw new Error('Server URL not available');
      }

      const { tools } = await connectToMCPServer({ name: server.server.name, serverUrl, authHeader });

      const mcpTools: MCPTool[] = tools.map((t) => ({
        name: t.name,
        serverName: server.server.name,
        description: t.description,
        inputSchema: t.inputSchema,
      }));

      setServers((prev) =>
        prev.map((s) =>
          s.server.id === id
            ? { ...s, tools: mcpTools, isConnected: true, isLoading: false }
            : s
        )
      );
    } catch (error) {
      setServers((prev) =>
        prev.map((s) =>
          s.server.id === id
            ? { ...s, isLoading: false, error: error instanceof Error ? error.message : '连接失败' }
            : s
        )
      );
    }
  }, [servers]);

  // 自动连接所有内置服务器
  useEffect(() => {
    if (servers.length === 0 || isLoading) return;

    // 延迟一下确保服务器列表已渲染
    const timer = setTimeout(() => {
      for (const server of servers) {
        if (server.server.isBuiltin && !server.isConnected && !server.isLoading) {
          console.log(`[MCPServerProvider] Auto-connecting builtin server: ${server.server.name}`);
          connectServer(server.server.id);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [servers, isLoading, connectServer]);

  // 断开服务器
  const disconnectServer = useCallback((id: string) => {
    const server = servers.find((s) => s.server.id === id);
    if (server?.server.serverUrl) {
      disconnectMCPServer(server.server.serverUrl);
    }

    setServers((prev) =>
      prev.map((s) =>
        s.server.id === id
          ? { ...s, tools: [], isConnected: false, error: undefined }
          : s
      )
    );
  }, [servers]);

  // 选中服务器
  const selectServer = useCallback((id: string | null) => {
    setSelectedServerId(id);
  }, []);

  // 切换工具选择
  const toggleTool = useCallback((serverId: string, toolName: string) => {
    const toolId = `${serverId}:${toolName}`;
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  }, []);

  // 全选服务器工具
  const selectAllTools = useCallback((serverId: string) => {
    const server = servers.find((s) => s.server.id === serverId);
    if (!server) return;

    const newTools = server.tools.map((t) => `${serverId}:${t.name}`);
    setSelectedTools((prev) => {
      const existing = new Set(prev);
      return [...prev, ...newTools.filter((t) => !existing.has(t))];
    });
  }, [servers]);

  // 取消全选服务器工具
  const deselectAllTools = useCallback((serverId: string) => {
    setSelectedTools((prev) => prev.filter((t) => !t.startsWith(`${serverId}:`)));
  }, []);

  const value: Parameters<typeof MCPServerContext.Provider>[0]['value'] = {
    servers,
    selectedServerId,
    selectedTools,
    isLoading,
    addServer,
    removeServer,
    connectServer,
    disconnectServer,
    selectServer,
    toggleTool,
    selectAllTools,
    deselectAllTools,
  };

  return <MCPServerContext.Provider value={value}>{children}</MCPServerContext.Provider>;
}
