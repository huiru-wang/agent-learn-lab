import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

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

export interface ToolCallInfo {
  name: string;
  args: Record<string, unknown>;
}

interface ToolCallState {
  messages: Message[];
  trace: TraceStep[];
  isStreaming: boolean;
  currentToolCall: ToolCallInfo | null;
  toolExecutionResult: unknown | null;

  // actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastAssistantMessage: (content: string) => void;
  addTraceStep: (step: Omit<TraceStep, 'id'>) => string;
  updateTraceStep: (id: string, updates: Partial<Omit<TraceStep, 'id'>>) => void;
  setIsStreaming: (streaming: boolean) => void;
  setCurrentToolCall: (toolCall: ToolCallInfo | null) => void;
  setToolResult: (result: unknown) => void;
  clearAll: () => void;
}

export const useToolCallStore = create<ToolCallState>((set) => ({
  messages: [],
  trace: [],
  isStreaming: false,
  currentToolCall: null,
  toolExecutionResult: null,

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

  setCurrentToolCall: (toolCall) => set({ currentToolCall: toolCall }),

  setToolResult: (result) => set({ toolExecutionResult: result }),

  clearAll: () =>
    set({
      messages: [],
      trace: [],
      isStreaming: false,
      currentToolCall: null,
      toolExecutionResult: null,
    }),
}));
