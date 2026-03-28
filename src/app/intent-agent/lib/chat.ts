import { useIntentAgentStore, type AnalyzeResponse } from './store';
import { predefinedIntents } from './intent-registry';
import { parseSSEEvents } from '@/lib/chat-utils';

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
        // Cast to any for backward compatibility with module-specific event format
        const e = event as { type: string; request?: unknown; delta?: string; result?: AnalyzeResponse; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }; reasoning?: string; error?: string; module?: string; timestamp?: number };

        if (e.type === 'request' && e.request) {
          const logId = `req-${Date.now()}`;
          requestLogId = logId;
          store.updateLastMessageRequestLogId(logId);
          store.addRequestLog({
            id: logId,
            timestamp: startTime,
            type: 'request',
            data: e.request,
          });
        } else if (e.type === 'reasoning_delta' && e.delta) {
          fullThinking += e.delta;
          store.appendThinkingContent(e.delta);

          // 记录到 response log
          const logId = `think-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          responseLogIds.push(logId);
          store.addRequestLog({
            id: logId,
            timestamp: Date.now(),
            type: 'response',
            data: { type: 'reasoning_delta', delta: e.delta },
          });
        } else if (e.type === 'content_delta' && e.delta) {
          fullContent += e.delta;
          store.appendContentContent(e.delta);

          // 记录到 response log
          const logId = `content-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          responseLogIds.push(logId);
          store.addRequestLog({
            id: logId,
            timestamp: Date.now(),
            type: 'response',
            data: { type: 'content_delta', delta: e.delta },
          });
        } else if (e.type === 'intent_result' && e.result) {
          store.setResult(e.result);
        } else if (e.type === 'done') {
          // 记录完整响应日志
          const doneLogId = `done-${Date.now()}`;
          responseLogIds.push(doneLogId);
          store.addRequestLog({
            id: doneLogId,
            timestamp: Date.now(),
            type: 'response',
            data: {
              type: 'done',
              usage: e.usage,
              reasoning: e.reasoning,
              content: fullContent,
            },
            duration: Date.now() - startTime,
          });
        } else if (e.type === 'error') {
          throw new Error(e.error || 'Stream error');
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
