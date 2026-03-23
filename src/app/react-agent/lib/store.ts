import { create } from 'zustand';
import type { ToolName } from './tools';

// ── 类型定义 ────────────────────────────────────────────────────

export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'done' | 'error' | 'replaying';

export interface Step {
  id: string;
  thought: string;
  action: {
    toolName: ToolName;
    arguments: Record<string, unknown>;
  } | null;
  observation: string | null;
  isError: boolean;
}

export interface ExecutionTrace {
  steps: Step[];
  finalAnswer: string | null;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
}

// ── Store 接口 ──────────────────────────────────────────────────

interface ReactAgentState {
  // 执行状态
  status: ExecutionStatus;
  // 可用工具列表
  enabledTools: ToolName[];
  // 任务输入
  taskInput: string;
  // 执行轨迹
  trace: ExecutionTrace;
  // 当前步骤（用于单步执行）
  currentStepIndex: number;
  // 当前步骤内容（实时更新）
  currentThought: string;
  currentAction: Step['action'] | null;
  currentObservation: string | null;
  // 回放速度
  replaySpeed: number; // 0.5, 1, 2
  // 错误信息
  error: string | null;

  // actions - 状态
  setStatus: (status: ExecutionStatus) => void;
  setEnabledTools: (tools: ToolName[]) => void;
  toggleTool: (tool: ToolName) => void;
  setTaskInput: (input: string) => void;

  // actions - 执行
  startExecution: () => void;
  appendThought: (delta: string) => void;
  setAction: (toolName: ToolName, args: Record<string, unknown>) => void;
  setObservation: (observation: string, isError?: boolean) => void;
  setFinalAnswer: (answer: string) => void;
  completeExecution: (usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void;
  failExecution: (error: string) => void;
  pauseExecution: () => void;
  resumeExecution: () => void;

  // actions - 单步执行
  setCurrentStepIndex: (index: number) => void;
  stepForward: () => void;
  stepBackward: () => void;

  // actions - 回放
  startReplay: () => void;
  stopReplay: () => void;
  setReplaySpeed: (speed: number) => void;

  // actions - 清除
  clearTrace: () => void;
  reset: () => void;
}

// ── Store 实现 ──────────────────────────────────────────────────

export const useReactAgentStore = create<ReactAgentState>((set, get) => ({
  status: 'idle',
  enabledTools: ['weather_api', 'calculator', 'search'],
  taskInput: '',
  trace: {
    steps: [],
    finalAnswer: null,
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
  },
  currentStepIndex: -1,
  currentThought: '',
  currentAction: null,
  currentObservation: null,
  replaySpeed: 1,
  error: null,

  setStatus: (status) => set({ status }),
  setEnabledTools: (tools) => set({ enabledTools: tools }),
  toggleTool: (tool) =>
    set((state) => ({
      enabledTools: state.enabledTools.includes(tool)
        ? state.enabledTools.filter((t) => t !== tool)
        : [...state.enabledTools, tool],
    })),
  setTaskInput: (input) => set({ taskInput: input }),

  startExecution: () =>
    set({
      status: 'running',
      trace: {
        steps: [],
        finalAnswer: null,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
      },
      currentStepIndex: -1,
      currentThought: '',
      currentAction: null,
      currentObservation: null,
      error: null,
    }),

  appendThought: (delta) =>
    set((state) => ({
      currentThought: state.currentThought + delta,
    })),

  setAction: (toolName, args) =>
    set({
      currentAction: { toolName, arguments: args },
    }),

  setObservation: (observation, isError = false) =>
    set((state) => {
      const newStep: Step = {
        id: `step-${state.trace.steps.length + 1}-${Date.now()}`,
        thought: state.currentThought,
        action: state.currentAction,
        observation,
        isError,
      };
      return {
        trace: {
          ...state.trace,
          steps: [...state.trace.steps, newStep],
        },
        currentThought: '',
        currentAction: null,
        currentObservation: null,
      };
    }),

  setFinalAnswer: (answer) =>
    set((state) => ({
      trace: {
        ...state.trace,
        finalAnswer: answer,
      },
    })),

  completeExecution: (usage) =>
    set((state) => ({
      status: 'done',
      trace: {
        ...state.trace,
        totalTokens: usage?.total_tokens || 0,
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
      },
    })),

  failExecution: (error) =>
    set({
      status: 'error',
      error,
    }),

  pauseExecution: () =>
    set({
      status: 'paused',
    }),

  resumeExecution: () =>
    set({
      status: 'running',
    }),

  setCurrentStepIndex: (index) =>
    set({
      currentStepIndex: index,
    }),

  stepForward: () =>
    set((state) => {
      const nextIndex = state.currentStepIndex + 1;
      if (nextIndex >= state.trace.steps.length) {
        return { status: 'done' };
      }
      return { currentStepIndex: nextIndex };
    }),

  stepBackward: () =>
    set((state) => {
      const prevIndex = Math.max(-1, state.currentStepIndex - 1);
      return { currentStepIndex: prevIndex };
    }),

  startReplay: () =>
    set((state) => ({
      status: 'replaying',
      currentStepIndex: -1,
    })),

  stopReplay: () =>
    set({
      status: 'done',
      currentStepIndex: -1,
    }),

  setReplaySpeed: (speed) =>
    set({
      replaySpeed: speed,
    }),

  clearTrace: () =>
    set({
      trace: {
        steps: [],
        finalAnswer: null,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
      },
      currentStepIndex: -1,
      currentThought: '',
      currentAction: null,
      currentObservation: null,
      error: null,
    }),

  reset: () =>
    set({
      status: 'idle',
      taskInput: '',
      trace: {
        steps: [],
        finalAnswer: null,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
      },
      currentStepIndex: -1,
      currentThought: '',
      currentAction: null,
      currentObservation: null,
      error: null,
    }),
}));
