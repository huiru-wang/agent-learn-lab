import {
  getModelConfigById as getConfigById,
  getModelConfigs,
} from './config';
import type { ModelConfig } from './config';
import { logRequest, logResponse } from './llm-logger';

// ── 兼容性重导出（供 /api/models/route.ts 等使用）──────────────────────────
export type { ModelConfig };
export const getModelConfigById = getConfigById;
export async function getAvailableModels(): Promise<ModelConfig[]> {
  return getModelConfigs();
}

// ── Tool 定义类型 ─────────────────────────────────────────────────────────────
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema object
}

// ── 核心接口 ──────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  // tool_calls 用于 assistant 消息携带工具调用结果
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  // tool_call_id 用于 tool 角色消息
  tool_call_id?: string;
  name?: string;
}

export interface ChatCompletionOptions {
  model: ModelConfig;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  tools?: ToolDefinition[];
  enableThinking?: boolean;
}

export interface RequestLog {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface ResponseLog {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface StreamChunk {
  raw: string;
  parsed: unknown;
}

export interface ChatCompletionResult {
  request: RequestLog;
  response?: ResponseLog;
  chunks?: StreamChunk[];
  text?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finish_reason?: string;
}

// ── 累积的工具调用结构 ─────────────────────────────────────────────────────────
export interface AccumulatedToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

// ── StreamEvent 类型 ──────────────────────────────────────────────────────────
export interface StreamEvent {
  type: 'request' | 'chunk' | 'done' | 'error' | 'tool_call_complete' | 'reasoning_delta';
  data:
    | StreamRequestData
    | StreamChunkData
    | StreamDoneData
    | StreamErrorData
    | StreamToolCallCompleteData
    | StreamReasoningDeltaData;
}

export interface StreamRequestData {
  request: RequestLog;
}

export interface StreamChunkData {
  chunk: StreamChunk;
}

export interface StreamDoneData {
  usage?: ChatCompletionResult['usage'];
  finish_reason?: string;
}

export interface StreamErrorData {
  error: string;
}

export interface StreamToolCallCompleteData {
  tool_calls: AccumulatedToolCall[];
  finish_reason: 'tool_calls';
}

export interface StreamReasoningDeltaData {
  reasoning_delta: string;
}

// ── 工具函数 ──────────────────────────────────────────────────────────────────
function buildUrl(baseUrl: string): string {
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url += 'chat/completions';
  return url;
}

function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return '***';
  }
  return apiKey.slice(0, 4) + '***' + apiKey.slice(-4);
}

function headersToObject(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function buildRequestBody(options: ChatCompletionOptions, stream: boolean): Record<string, unknown> {
  const { model, messages, temperature, maxTokens, topP, tools, enableThinking } = options;

  const body: Record<string, unknown> = {
    model: model.model,
    messages,
    stream,
  };

  if (temperature !== undefined) body.temperature = temperature;
  if (maxTokens !== undefined) body.max_tokens = maxTokens;
  if (topP !== undefined) body.top_p = topP;

  if (tools && tools.length > 0) {
    body.tools = tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));
  }

  if (enableThinking) {
    body.enable_thinking = true;
    body.stream_options = { include_usage: true };
  }

  return body;
}

function resolveApiCredentials(model: ModelConfig): { apiKey: string; baseUrl: string } {
  const apiKey =
    model.apiKey || process.env[`${model.provider.toUpperCase()}_API_KEY`] || '';
  const baseUrl =
    model.baseUrl ||
    process.env[`${model.provider.toUpperCase()}_BASE_URL`] ||
    'https://api.openai.com/v1';
  return { apiKey, baseUrl };
}

// ── chatCompletion（非流式）────────────────────────────────────────────────────
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const { apiKey, baseUrl } = resolveApiCredentials(options.model);

  const url = buildUrl(baseUrl);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const body = buildRequestBody(options, false);

  // 记录请求
  logRequest(body);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorJson: unknown;
    try {
      errorJson = JSON.parse(errorBody);
    } catch {
      errorJson = errorBody;
    }
    logResponse(errorJson);
    return {
      request: { url, method: 'POST', headers: { ...headers, Authorization: `Bearer ${maskApiKey(apiKey)}` }, body },
      response: { status: response.status, statusText: response.statusText, headers: headersToObject(response.headers), body: errorJson },
    };
  }

  const responseBody = await response.json();
  const choice = responseBody.choices?.[0];
  const usage = responseBody.usage;

  // 记录响应
  logResponse(responseBody, choice?.finish_reason);

  return {
    request: { url, method: 'POST', headers: { ...headers, Authorization: `Bearer ${maskApiKey(apiKey)}` }, body },
    response: { status: response.status, statusText: response.statusText, headers: headersToObject(response.headers), body: responseBody },
    text: choice?.message?.content || '',
    usage: usage
      ? {
          prompt_tokens: usage.prompt_tokens || 0,
          completion_tokens: usage.completion_tokens || 0,
          total_tokens: usage.total_tokens || 0,
        }
      : undefined,
    finish_reason: choice?.finish_reason,
  };
}

// ── chatCompletionStream（流式，支持 tool_calls delta）────────────────────────
export async function* chatCompletionStream(
  options: ChatCompletionOptions
): AsyncGenerator<StreamEvent> {
  const { apiKey, baseUrl } = resolveApiCredentials(options.model);

  const url = buildUrl(baseUrl);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const body = buildRequestBody(options, true);

  // 记录请求
  logRequest(body);

  const requestLog: RequestLog = {
    url,
    method: 'POST',
    headers: {
      ...headers,
      Authorization: `Bearer ${maskApiKey(apiKey)}`,
    },
    body,
  };

  yield {
    type: 'request',
    data: { request: requestLog },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorJson: unknown;
    try {
      errorJson = JSON.parse(errorBody);
    } catch {
      errorJson = errorBody;
    }
    logResponse(errorJson);
    yield {
      type: 'error',
      data: { error: `HTTP ${response.status}: ${errorBody}` },
    };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield {
      type: 'error',
      data: { error: 'No response body' },
    };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let totalUsage: ChatCompletionResult['usage'];
  let finishReason: string | undefined;

  // 累积 tool_calls delta
  const accumulatedToolCalls: Record<
    number,
    { id: string; type: 'function'; function: { name: string; arguments: string } }
  > = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const raw = trimmed;
      const dataStr = trimmed.slice(6);

      if (dataStr === '[DONE]') {
        yield {
          type: 'chunk',
          data: { chunk: { raw, parsed: null } },
        };
        continue;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(dataStr);
      } catch {
        continue;
      }

      yield {
        type: 'chunk',
        data: { chunk: { raw, parsed } },
      };

      const typedParsed = parsed as {
        choices?: Array<{
          delta?: {
            content?: string;
            reasoning_content?: string;
            tool_calls?: Array<{
              index: number;
              id?: string;
              type?: 'function';
              function?: { name?: string; arguments?: string };
            }>;
          };
          finish_reason?: string | null;
        }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
      };

      const choice = typedParsed?.choices?.[0];

      // 发送 reasoning_content delta
      const reasoningContent = choice?.delta?.reasoning_content;
      if (reasoningContent) {
        yield {
          type: 'reasoning_delta',
          data: { reasoning_delta: reasoningContent },
        };
      }

      // 累积 tool_calls delta
      const toolCallsDelta = choice?.delta?.tool_calls;
      if (toolCallsDelta) {
        for (const tc of toolCallsDelta) {
          const idx = tc.index;
          if (!accumulatedToolCalls[idx]) {
            accumulatedToolCalls[idx] = {
              id: tc.id || '',
              type: 'function',
              function: { name: tc.function?.name || '', arguments: '' },
            };
          } else {
            if (tc.id) accumulatedToolCalls[idx].id = tc.id;
            if (tc.function?.name) accumulatedToolCalls[idx].function.name = tc.function.name;
          }
          if (tc.function?.arguments) {
            accumulatedToolCalls[idx].function.arguments += tc.function.arguments;
          }
        }
      }

      if (choice?.finish_reason) {
        finishReason = choice.finish_reason;
      }
      if (typedParsed?.usage) {
        totalUsage = {
          prompt_tokens: typedParsed.usage.prompt_tokens || 0,
          completion_tokens: typedParsed.usage.completion_tokens || 0,
          total_tokens: typedParsed.usage.total_tokens || 0,
        };
      }
      if (typedParsed?.usage) {
        totalUsage = {
          prompt_tokens: typedParsed.usage.prompt_tokens || 0,
          completion_tokens: typedParsed.usage.completion_tokens || 0,
          total_tokens: typedParsed.usage.total_tokens || 0,
        };
      }
    }
  }

  // 记录响应（流式响应没有完整 body，记录 usage 作为响应代表）
  const toolCallsArray = Object.values(accumulatedToolCalls);
  logResponse({ usage: totalUsage, finish_reason: finishReason, tool_calls: toolCallsArray }, finishReason);

  // 如果 finish_reason 是 tool_calls，发送 tool_call_complete 事件
  if (finishReason === 'tool_calls') {
    yield {
      type: 'tool_call_complete',
      data: {
        tool_calls: toolCallsArray,
        finish_reason: 'tool_calls',
      },
    };
    return;
  }

  yield {
    type: 'done',
    data: {
      usage: totalUsage,
      finish_reason: finishReason,
    },
  };
}
