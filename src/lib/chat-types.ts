/**
 * Unified SSE event types for all chat modules.
 * Each event includes a `module` discriminator for frontend routing.
 */

export type ModuleType = 'chatbot' | 'intent' | 'react' | 'tool-call' | 'mcp';

interface BaseSSEEvent {
  module: ModuleType;
  type: string;
  timestamp: number;
}

// Core events (all modules)
export interface RequestEvent extends BaseSSEEvent {
  type: 'request';
  request: RequestLog;
}

export interface ChunkEvent extends BaseSSEEvent {
  type: 'chunk';
  delta: string;
  thinkingDelta?: string;
}

export interface DoneEvent extends BaseSSEEvent {
  type: 'done';
  usage?: Usage;
  finish_reason?: string;
  reasoning?: string;
}

export interface ErrorEvent extends BaseSSEEvent {
  type: 'error';
  error: string;
}

// Intent-specific events
export interface ReasoningDeltaEvent extends BaseSSEEvent {
  type: 'reasoning_delta';
  delta: string;
}

export interface ContentDeltaEvent extends BaseSSEEvent {
  type: 'content_delta';
  delta: string;
}

export interface IntentResultEvent extends BaseSSEEvent {
  type: 'intent_result';
  result: IntentResult;
}

// React Agent events
export interface ThoughtEvent extends BaseSSEEvent {
  type: 'thought';
  thought: string;
}

export interface ThoughtDeltaEvent extends BaseSSEEvent {
  type: 'thought_delta';
  delta: string;
}

export interface ActionEvent extends BaseSSEEvent {
  type: 'action';
  toolName: string;
  args: Record<string, unknown>;
}

export interface ObservationEvent extends BaseSSEEvent {
  type: 'observation';
  observation: string;
  isError?: boolean;
}

export interface FinalAnswerEvent extends BaseSSEEvent {
  type: 'final_answer';
  answer: string;
}

// Tool-call/MCP events
export interface LLMRequestEvent extends BaseSSEEvent {
  type: 'llm_request';
  round: number;
  request: RequestLog;
}

export interface LLMResponseEvent extends BaseSSEEvent {
  type: 'llm_response';
  round: number;
  response: LLMResponse;
}

export interface ToolCallEvent extends BaseSSEEvent {
  type: 'tool_call';
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolResultEvent extends BaseSSEEvent {
  type: 'tool_result';
  toolName: string;
  result: unknown;
}

// Shared types
export interface RequestLog {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface LLMResponse {
  finish_reason: string;
  content?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  usage?: Usage;
}

export interface IntentResult {
  primaryIntent: {
    name: string;
    label: string;
    confidence: number;
  };
  slots: Array<{
    name: string;
    label: string;
    value: string;
    normalized?: string;
  }>;
  allIntents: Array<{
    name: string;
    label: string;
    confidence: number;
  }>;
  reasoning: string;
}

// Union type for all events
export type ChatSSEEvent =
  | RequestEvent
  | ChunkEvent
  | DoneEvent
  | ErrorEvent
  | ReasoningDeltaEvent
  | ContentDeltaEvent
  | IntentResultEvent
  | ThoughtEvent
  | ThoughtDeltaEvent
  | ActionEvent
  | ObservationEvent
  | FinalAnswerEvent
  | LLMRequestEvent
  | LLMResponseEvent
  | ToolCallEvent
  | ToolResultEvent;
