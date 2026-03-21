'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MCPServer {
  id: string;
  name: string;
  serverUrl: string;
  authHeader?: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: unknown;
}

export interface MCPResource {
  uri: string;
  name?: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{ name: string; description?: string; required?: boolean }>;
}

export interface CallLogEntry {
  id: string;
  type: 'tool_call' | 'tool_result' | 'resource_read' | 'prompt_get';
  title: string;
  detail: {
    request?: unknown;
    response?: unknown;
  };
  timestamp: number;
}

interface MCPState {
  // Connection state
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  currentSessionId: string | null;
  currentServerId: string | null;
  errorMessage: string | null;

  // Server list (persisted)
  servers: MCPServer[];

  // Discovered capabilities
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];

  // Call logs
  callLogs: CallLogEntry[];

  // Actions
  addServer: (server: Omit<MCPServer, 'id'>) => string;
  removeServer: (id: string) => void;
  setConnectionStatus: (status: MCPState['connectionStatus'], errorMessage?: string) => void;
  setCurrentSession: (sessionId: string | null, serverId: string | null) => void;
  setTools: (tools: MCPTool[]) => void;
  setResources: (resources: MCPResource[]) => void;
  setPrompts: (prompts: MCPPrompt[]) => void;
  addCallLog: (entry: Omit<CallLogEntry, 'id' | 'timestamp'>) => void;
  clearCallLogs: () => void;
  reset: () => void;
}

export const useMCPStore = create<MCPState>()(
  persist(
    (set, get) => ({
      // Initial state
      connectionStatus: 'disconnected',
      currentSessionId: null,
      currentServerId: null,
      errorMessage: null,
      servers: [],
      tools: [],
      resources: [],
      prompts: [],
      callLogs: [],

      addServer: (server) => {
        const id = `server_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        set((state) => ({
          servers: [...state.servers, { ...server, id }],
        }));
        return id;
      },

      removeServer: (id) => {
        set((state) => ({
          servers: state.servers.filter((s) => s.id !== id),
          currentServerId: state.currentServerId === id ? null : state.currentServerId,
        }));
      },

      setConnectionStatus: (status, errorMessage) => {
        set({ connectionStatus: status, errorMessage: errorMessage || null });
      },

      setCurrentSession: (sessionId, serverId) => {
        set({
          currentSessionId: sessionId,
          currentServerId: serverId,
          tools: [],
          resources: [],
          prompts: [],
        });
      },

      setTools: (tools) => set({ tools }),
      setResources: (resources) => set({ resources }),
      setPrompts: (prompts) => set({ prompts }),

      addCallLog: (entry) => {
        const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        set((state) => ({
          callLogs: [...state.callLogs, { ...entry, id, timestamp: Date.now() }],
        }));
      },

      clearCallLogs: () => set({ callLogs: [] }),

      reset: () => {
        set({
          connectionStatus: 'disconnected',
          currentSessionId: null,
          currentServerId: null,
          errorMessage: null,
          tools: [],
          resources: [],
          prompts: [],
          callLogs: [],
        });
      },
    }),
    {
      name: 'mcp-servers',
      partialize: (state) => ({
        // Only persist servers, not connection state
        servers: state.servers,
      }),
    }
  )
);
