import { create } from 'zustand';

// ── 消息类型 ────────────────────────────────────────────────────
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinkingContent?: string;
  timestamp: number;
  requestLogId?: string;
  responseLogIds?: string[];
}

// ── 请求日志（复用 Chatbot 模式）────────────────────────────────
export interface RequestLog {
  id: string;
  timestamp: number;
  type: 'request' | 'response';
  data: unknown;
  duration?: number;
}

// ── 意图分析结果 ────────────────────────────────────────────────
export interface IntentResult {
  name: string;
  label: string;
  confidence: number;
}

export interface SlotResult {
  name: string;
  label: string;
  value: string;
  normalized?: string;
}

export interface AnalyzeResponse {
  primaryIntent: IntentResult;
  slots: SlotResult[];
  allIntents: IntentResult[];
  reasoning: string;
}

// ── Store ────────────────────────────────────────────────────────
interface IntentAgentState {
  // 消息列表
  messages: Message[];
  // 请求/响应日志
  requestLog: RequestLog[];
  // 流式状态
  isStreaming: boolean;
  currentThinkingContent: string;
  currentContentContent: string;
  // 意图分析结果（右侧面板用）
  result: AnalyzeResponse | null;
  error: string | null;

  // actions - 消息
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (updates: Partial<Omit<Message, 'id' | 'timestamp'>>) => void;
  updateLastMessageRequestLogId: (logId: string) => void;
  // actions - 日志
  addRequestLog: (log: RequestLog) => void;
  // actions - 流式
  setIsStreaming: (streaming: boolean) => void;
  setCurrentThinkingContent: (content: string) => void;
  appendThinkingContent: (delta: string) => void;
  setCurrentContentContent: (content: string) => void;
  appendContentContent: (delta: string) => void;
  // actions - 结果
  setResult: (result: AnalyzeResponse) => void;
  setError: (error: string | null) => void;
  // actions - 清除
  clearAll: () => void;
}

export const useIntentAgentStore = create<IntentAgentState>((set) => ({
  messages: [],
  requestLog: [],
  isStreaming: false,
  currentThinkingContent: '',
  currentContentContent: '',
  result: null,
  error: null,

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

  updateLastMessage: (updates) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          ...updates,
        };
      }
      return { messages };
    }),

  updateLastMessageRequestLogId: (logId) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          requestLogId: logId,
        };
      }
      return { messages };
    }),

  addRequestLog: (log) =>
    set((state) => ({
      requestLog: [...state.requestLog, log],
    })),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  setCurrentThinkingContent: (content) =>
    set({ currentThinkingContent: content }),

  appendThinkingContent: (delta) =>
    set((state) => ({
      currentThinkingContent: state.currentThinkingContent + delta,
    })),

  setCurrentContentContent: (content) =>
    set({ currentContentContent: content }),

  appendContentContent: (delta) =>
    set((state) => ({
      currentContentContent: state.currentContentContent + delta,
    })),

  setResult: (result) => set({ result, error: null }),

  setError: (error) => set({ error }),

  clearAll: () =>
    set({
      messages: [],
      requestLog: [],
      isStreaming: false,
      currentThinkingContent: '',
      currentContentContent: '',
      result: null,
      error: null,
    }),
}));
