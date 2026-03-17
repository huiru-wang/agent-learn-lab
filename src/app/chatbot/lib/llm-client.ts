import type { ModelConfig } from '@/lib/config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model: ModelConfig;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
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

export interface StreamEvent {
  type: 'request' | 'chunk' | 'done' | 'error';
  data: StreamRequestData | StreamChunkData | StreamDoneData | StreamErrorData;
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

export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const { model, messages, temperature, maxTokens, topP, stream = false } = options;

  const apiKey = model.apiKey || process.env[`${model.provider.toUpperCase()}_API_KEY`] || '';
  const baseUrl = model.baseUrl || process.env[`${model.provider.toUpperCase()}_BASE_URL`] || 'https://api.openai.com/v1';

  const url = buildUrl(baseUrl);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const body: Record<string, unknown> = {
    model: model.model,
    messages,
    stream,
  };

  if (temperature !== undefined) body.temperature = temperature;
  if (maxTokens !== undefined) body.max_tokens = maxTokens;
  if (topP !== undefined) body.top_p = topP;

  const requestLog: RequestLog = {
    url,
    method: 'POST',
    headers: {
      ...headers,
      'Authorization': `Bearer ${maskApiKey(apiKey)}`,
    },
    body,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const responseHeaders = headersToObject(response.headers);
  const responseLog: ResponseLog = {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: null,
  };

  if (!response.ok) {
    const errorBody = await response.text();
    let errorJson: unknown;
    try {
      errorJson = JSON.parse(errorBody);
    } catch {
      errorJson = errorBody;
    }
    responseLog.body = errorJson;
    return {
      request: requestLog,
      response: responseLog,
    };
  }

  const responseBody = await response.json();
  responseLog.body = responseBody;

  const choice = responseBody.choices?.[0];
  const usage = responseBody.usage;

  return {
    request: requestLog,
    response: responseLog,
    text: choice?.message?.content || '',
    usage: usage ? {
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
    } : undefined,
    finish_reason: choice?.finish_reason,
  };
}

export async function* chatCompletionStream(
  options: ChatCompletionOptions
): AsyncGenerator<StreamEvent> {
  const { model, messages, temperature, maxTokens, topP } = options;

  const apiKey = model.apiKey || process.env[`${model.provider.toUpperCase()}_API_KEY`] || '';
  const baseUrl = model.baseUrl || process.env[`${model.provider.toUpperCase()}_BASE_URL`] || 'https://api.openai.com/v1';

  const url = buildUrl(baseUrl);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const body: Record<string, unknown> = {
    model: model.model,
    messages,
    stream: true,
  };

  if (temperature !== undefined) body.temperature = temperature;
  if (maxTokens !== undefined) body.max_tokens = maxTokens;
  if (topP !== undefined) body.top_p = topP;

  const requestLog: RequestLog = {
    url,
    method: 'POST',
    headers: {
      ...headers,
      'Authorization': `Bearer ${maskApiKey(apiKey)}`,
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
          data: {
            chunk: { raw, parsed: null },
          },
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
        data: {
          chunk: { raw, parsed },
        },
      };

      const typedParsed = parsed as {
        choices?: Array<{
          delta?: { content?: string };
          finish_reason?: string;
        }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
      };

      const choice = typedParsed?.choices?.[0];
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
    }
  }

  yield {
    type: 'done',
    data: {
      usage: totalUsage,
      finish_reason: finishReason,
    },
  };
}
