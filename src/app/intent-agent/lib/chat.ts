import { useIntentAgentStore, type AnalyzeResponse } from './store';
import { predefinedIntents } from './intent-registry';

interface SSEEvent {
  type: 'request' | 'reasoning_delta' | 'content_delta' | 'intent_result' | 'done' | 'error';
  request?: unknown;
  delta?: string;
  result?: AnalyzeResponse;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  reasoning?: string;
  error?: string;
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

export async function sendIntentMessage(input: string, modelId: string) {
  const store = useIntentAgentStore.getState();
  const startTime = Date.now();

  store.setIsStreaming(true);
  store.setCurrentThinkingContent('');
  store.setCurrentContentContent('');
  store.setError(null);

  // 添加用户消息
  store.addMessage({ role: 'user', content: input });

  try {
    const response = await fetch('/intent-agent/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: input,
        model: modelId,
        intents: predefinedIntents,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullThinking = '';
    let fullContent = '';

    let requestLogId: string | undefined;
    const responseLogIds: string[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const { events, remaining } = parseSSEEvents(buffer);
      buffer = remaining;

      for (const event of events) {
        if (event.type === 'request' && event.request) {
          const logId = `req-${Date.now()}`;
          requestLogId = logId;
          store.updateLastMessageRequestLogId(logId);
          store.addRequestLog({
            id: logId,
            timestamp: startTime,
            type: 'request',
            data: event.request,
          });
        } else if (event.type === 'reasoning_delta' && event.delta) {
          fullThinking += event.delta;
          store.appendThinkingContent(event.delta);

          // 记录到 response log
          const logId = `think-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          responseLogIds.push(logId);
          store.addRequestLog({
            id: logId,
            timestamp: Date.now(),
            type: 'response',
            data: { type: 'reasoning_delta', delta: event.delta },
          });
        } else if (event.type === 'content_delta' && event.delta) {
          fullContent += event.delta;
          store.appendContentContent(event.delta);

          // 记录到 response log
          const logId = `content-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          responseLogIds.push(logId);
          store.addRequestLog({
            id: logId,
            timestamp: Date.now(),
            type: 'response',
            data: { type: 'content_delta', delta: event.delta },
          });
        } else if (event.type === 'intent_result' && event.result) {
          store.setResult(event.result);
        } else if (event.type === 'done') {
          // 记录完整响应日志
          const doneLogId = `done-${Date.now()}`;
          responseLogIds.push(doneLogId);
          store.addRequestLog({
            id: doneLogId,
            timestamp: Date.now(),
            type: 'response',
            data: {
              type: 'done',
              usage: event.usage,
              reasoning: event.reasoning,
              content: fullContent,
            },
            duration: Date.now() - startTime,
          });
        } else if (event.type === 'error') {
          throw new Error(event.error || 'Stream error');
        }
      }
    }

    // 添加 assistant 消息
    store.addMessage({
      role: 'assistant',
      content: fullContent,
      thinkingContent: fullThinking || undefined,
      requestLogId,
      responseLogIds,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    store.setError(errorMessage);
    store.addMessage({
      role: 'assistant',
      content: `Error: ${errorMessage}`,
    });
  } finally {
    store.setIsStreaming(false);
    store.setCurrentThinkingContent('');
    store.setCurrentContentContent('');
  }
}
