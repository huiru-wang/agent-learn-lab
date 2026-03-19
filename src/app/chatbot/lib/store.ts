import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokenCount?: number;
  requestLogId?: string;
  responseLogIds?: string[];
  isPruned?: boolean;
}

export interface AvailableModel {
  id: string;
  name: string;
  provider: string;
  model: string;
}

export interface ModelParams {
  model: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
}

interface ChatState {
  messages: Message[];
  modelParams: ModelParams;
  isStreaming: boolean;
  currentStreamContent: string;
  totalTokens: number;
  requestLog: RequestLog[];
  availableModels: AvailableModel[];
  modelsLoaded: boolean;
  isCompressing: boolean;
  contextMaxTokens: number;
  
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  updateLastMessageRequestLogId: (logId: string) => void;
  setModelParams: (params: Partial<ModelParams>) => void;
  setIsStreaming: (streaming: boolean) => void;
  setCurrentStreamContent: (content: string) => void;
  appendStreamContent: (content: string) => void;
  clearMessages: () => void;
  addRequestLog: (log: RequestLog) => void;
  setAvailableModels: (models: AvailableModel[]) => void;
  setIsCompressing: (compressing: boolean) => void;
  pruneMessages: (prunedIds: string[]) => void;
}

export interface RequestLog {
  id: string;
  timestamp: number;
  type: 'request' | 'response';
  data: unknown;
  duration?: number;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  modelParams: {
    model: '',
    temperature: 0.7,
    maxTokens: 512,
    stream: true,
  },
  isStreaming: false,
  currentStreamContent: '',
  totalTokens: 0,
  requestLog: [],
  availableModels: [],
  modelsLoaded: false,
  isCompressing: false,
  contextMaxTokens: 1024,

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

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
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

  setModelParams: (params) =>
    set((state) => ({
      modelParams: { ...state.modelParams, ...params },
    })),

  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  setCurrentStreamContent: (content) => set({ currentStreamContent: content }),

  appendStreamContent: (content) =>
    set((state) => ({
      currentStreamContent: state.currentStreamContent + content,
    })),

  clearMessages: () =>
    set({
      messages: [],
      totalTokens: 0,
      currentStreamContent: '',
      requestLog: [],
    }),

  addRequestLog: (log) =>
    set((state) => ({
      requestLog: [...state.requestLog, log],
    })),

  setAvailableModels: (models) =>
    set((state) => {
      const currentModel = state.modelParams.model;
      const firstModel = models[0]?.id || '';
      return {
        availableModels: models,
        modelsLoaded: true,
        modelParams: {
          ...state.modelParams,
          model: currentModel || firstModel,
        },
      };
    }),

  setIsCompressing: (compressing) => set({ isCompressing: compressing }),

  pruneMessages: (prunedIds) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        prunedIds.includes(msg.id) ? { ...msg, isPruned: true } : msg
      ),
    })),
}));
