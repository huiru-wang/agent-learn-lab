'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { MCPServer, MCPTool, MCPServerWithTools } from './types';

// Context value 类型
export interface MCPContextValue {
  // 服务器列表（带工具和状态）
  servers: MCPServerWithTools[];
  // 选中的服务器 ID
  selectedServerId: string | null;
  // 选中的工具列表（格式: "serverId:toolName"）
  selectedTools: string[];
  // 是否正在加载
  isLoading: boolean;

  // 服务器操作
  addServer: (server: Omit<MCPServer, 'id'>) => string;
  removeServer: (id: string) => void;
  connectServer: (id: string) => Promise<void>;
  disconnectServer: (id: string) => void;

  // 工具选择操作
  selectServer: (id: string | null) => void;
  toggleTool: (serverId: string, toolName: string) => void;
  selectAllTools: (serverId: string) => void;
  deselectAllTools: (serverId: string) => void;
}

// 创建 Context
const MCPServerContext = createContext<MCPContextValue | null>(null);

// Provider props
interface MCPServerProviderProps {
  children: ReactNode;
  // 初始选中的工具（用于恢复状态）
  initialSelectedTools?: string[];
}

export { MCPServerContext };
export type { MCPServerProviderProps };
