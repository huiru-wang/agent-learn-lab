import { create } from 'zustand';

export type CompressionMode = 'sliding-window' | 'summary' | 'importance' | 'hierarchical';

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokenCount?: number;
  requestLogId?: string;
  responseLogIds?: string[];
  isCompressed?: boolean;
  isSummary?: boolean;
  originalContent?: string;
  importanceScore?: number;
}

export interface CompressedMessage {
  id: string;
  originalIds: string[];
  summary: string;
  timestamp: number;
  tokenCount: number;
  originalTokenCount: number;
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
  topP: number;
  stream: boolean;
  compressionMode: CompressionMode;
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
  compressedMessages: CompressedMessage[];
  contextLimit: number;
  isCompressing: boolean;
  
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
  setCompressedMessages: (messages: CompressedMessage[]) => void;
  setContextLimit: (limit: number) => void;
  setCompressionMode: (mode: CompressionMode) => void;
  setIsCompressing: (compressing: boolean) => void;
  applyCompression: (retained: Message[], compressed: CompressedMessage[]) => void;
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
    topP: 1,
    stream: true,
    compressionMode: 'sliding-window',
  },
  isStreaming: false,
  currentStreamContent: '',
  totalTokens: 0,
  requestLog: [],
  availableModels: [],
  modelsLoaded: false,
  compressedMessages: [],
  contextLimit: 1024,
  isCompressing: false,

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

  setCompressedMessages: (messages) => set({ compressedMessages: messages }),

  setContextLimit: (limit) => set({ contextLimit: limit }),

  setCompressionMode: (mode) =>
    set((state) => ({
      modelParams: { ...state.modelParams, compressionMode: mode },
      messages: [],
      compressedMessages: [],
      totalTokens: 0,
      currentStreamContent: '',
      requestLog: [],
    })),

  setIsCompressing: (compressing) => set({ isCompressing: compressing }),

  applyCompression: (messages, compressed) =>
    set((state) => ({
      messages,
      compressedMessages: [...state.compressedMessages, ...compressed],
    })),
}));
