'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── MCP Server / Capabilities ────────────────────────────────────────────────

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

// ── Execution Trace (aligned with tool-call module) ──────────────────────────

export type TraceStepStatus = 'pending' | 'active' | 'completed' | 'error';

export interface TraceStepDetail {
  request?: unknown;
  response?: unknown;
  stepType?: 'llm_request' | 'llm_response' | 'tool_call' | 'tool_call_result';
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

export interface TraceStep {
  id: string;
  label: string;
  content?: string;
  status: TraceStepStatus;
  detail?: TraceStepDetail;
}

// ── Message ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ── Store ────────────────────────────────────────────────────────────────────

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

  // Messages
  messages: Message[];

  // Execution trace (aligned with tool-call)
  trace: TraceStep[];
  isStreaming: boolean;

  // Server actions
  addServer: (server: Omit<MCPServer, 'id'>) => string;
  removeServer: (id: string) => void;
  setConnectionStatus: (status: MCPState['connectionStatus'], errorMessage?: string) => void;
  setCurrentSession: (sessionId: string | null, serverId: string | null) => void;
  setTools: (tools: MCPTool[]) => void;
  setResources: (resources: MCPResource[]) => void;
  setPrompts: (prompts: MCPPrompt[]) => void;

  // Message actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastAssistantMessage: (content: string) => void;

  // Trace actions (aligned with tool-call)
  addTraceStep: (step: Omit<TraceStep, 'id'>) => string;
  updateTraceStep: (id: string, updates: Partial<Omit<TraceStep, 'id'>>) => void;
  setIsStreaming: (streaming: boolean) => void;

  // Reset
  clearAll: () => void;
  reset: () => void;
}

export const useMCPStore = create<MCPState>()(
  persist(
    (set) => ({
      // Initial state
      connectionStatus: 'disconnected',
      currentSessionId: null,
      currentServerId: null,
      errorMessage: null,
      servers: [],
      tools: [],
      resources: [],
      prompts: [],
      messages: [],
      trace: [],
      isStreaming: false,

      // Server actions
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

      // Message actions
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
            },
          ],
        })),

      updateLastAssistantMessage: (content) =>
        set((state) => {
          const messages = [...state.messages];
          const lastIdx = messages.length - 1;
          if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
            messages[lastIdx] = { ...messages[lastIdx], content };
          }
          return { messages };
        }),

      // Trace actions (aligned with tool-call)
      addTraceStep: (step) => {
        const id = `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          trace: [...state.trace, { ...step, id }],
        }));
        return id;
      },

      updateTraceStep: (id, updates) =>
        set((state) => ({
          trace: state.trace.map((step) =>
            step.id === id ? { ...step, ...updates } : step
          ),
        })),

      setIsStreaming: (streaming) => set({ isStreaming: streaming }),

      // Clear messages + trace (keep connection)
      clearAll: () =>
        set({
          messages: [],
          trace: [],
          isStreaming: false,
        }),

      // Full reset (disconnect)
      reset: () => {
        set({
          connectionStatus: 'disconnected',
          currentSessionId: null,
          currentServerId: null,
          errorMessage: null,
          tools: [],
          resources: [],
          prompts: [],
          messages: [],
          trace: [],
          isStreaming: false,
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
