import { useChatStore, type Message, type ModelParams } from './store';

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

interface SSEEvent {
  type: 'request' | 'chunk' | 'done' | 'error';
  data: {
    request?: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body: unknown;
    };
    chunk?: {
      raw: string;
      parsed: unknown;
    };
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    finish_reason?: string;
    error?: string;
  };
}

function parseSSEEvents(text: string): { events: SSEEvent[]; remaining: string } {
  const events: SSEEvent[] = [];
  const lines = text.split('\n');
  let remaining = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('data: ')) {
      try {
        const data = line.slice(6);
        if (data.trim()) {
          const event = JSON.parse(data) as SSEEvent;
          events.push(event);
        }
      } catch {
        remaining = text.slice(text.indexOf(line));
        break;
      }
    } else if (line && !line.startsWith(':')) {
      remaining = text.slice(text.indexOf(line));
      break;
    }
  }

  return { events, remaining };
}

export async function sendMessage(
  input: string,
  previousMessages: Message[],
  params: ModelParams
) {
  const store = useChatStore.getState();
  const startTime = Date.now();

  store.setIsStreaming(true);
  store.setCurrentStreamContent('');

  const tokenCount = estimateTokens(input);
  
  store.addMessage({
    role: 'user',
    content: input,
    tokenCount,
  });

  const messages = [...previousMessages, { role: 'user' as const, content: input }]
    .filter((m) => m.role !== 'system' || m.content)
    .map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }));

  try {
    const response = await fetch('/chatbot/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: params.model,
        messages,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        topP: params.topP,
        stream: params.stream,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    if (params.stream) {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';
      let totalUsage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | undefined;

      let requestLogId: string | undefined;
      const responseLogIds: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { events, remaining } = parseSSEEvents(buffer);
        buffer = remaining;

        for (const event of events) {
          if (event.type === 'request' && event.data.request) {
            const logId = `req-${Date.now()}`;
            requestLogId = logId;
            store.addRequestLog({
              id: logId,
              timestamp: startTime,
              type: 'request',
              data: event.data.request,
            });
            store.updateLastMessageRequestLogId(logId);
          } else if (event.type === 'chunk' && event.data.chunk) {
            const logId = `chunk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            responseLogIds.push(logId);
            store.addRequestLog({
              id: logId,
              timestamp: Date.now(),
              type: 'response',
              data: event.data.chunk,
            });

            const parsed = event.data.chunk.parsed as {
              choices?: Array<{ delta?: { content?: string } }>;
            } | null;

            if (parsed?.choices?.[0]?.delta?.content) {
              fullContent += parsed.choices[0].delta.content;
              store.setCurrentStreamContent(fullContent);
            }
          } else if (event.type === 'done') {
            totalUsage = event.data.usage;
          } else if (event.type === 'error') {
            throw new Error(event.data.error || 'Stream error');
          }
        }
      }

      const assistantTokenCount = totalUsage?.completion_tokens || estimateTokens(fullContent);

      store.addMessage({
        role: 'assistant',
        content: fullContent,
        tokenCount: assistantTokenCount,
        requestLogId,
        responseLogIds,
      });
    } else {
      const result = await response.json();
      const { request, response: responseLog, text, usage } = result;

      let requestLogId: string | undefined;
      const responseLogIds: string[] = [];

      if (request) {
        const logId = `req-${Date.now()}`;
        requestLogId = logId;
        store.addRequestLog({
          id: logId,
          timestamp: startTime,
          type: 'request',
          data: request,
        });
        store.updateLastMessageRequestLogId(logId);
      }

      const responseLogId = `res-${Date.now()}`;
      responseLogIds.push(responseLogId);
      store.addRequestLog({
        id: responseLogId,
        timestamp: Date.now(),
        type: 'response',
        data: responseLog,
        duration: Date.now() - startTime,
      });

      const assistantTokenCount = usage?.completion_tokens || estimateTokens(text || '');

      store.addMessage({
        role: 'assistant',
        content: text || '',
        tokenCount: assistantTokenCount,
        requestLogId,
        responseLogIds,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    store.addMessage({
      role: 'assistant',
      content: `Error: ${errorMessage}`,
    });
  } finally {
    store.setIsStreaming(false);
    store.setCurrentStreamContent('');
  }
}
