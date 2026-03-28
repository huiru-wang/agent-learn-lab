import { useChatStore, type Message, type ModelParams } from './store';
import { parseSSEEvents } from '@/lib/chat-utils';

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function calculateTotalTokens(messages: Message[]): number {
  return messages.reduce((acc, m) => acc + (m.tokenCount || estimateTokens(m.content)), 0);
}

function calculateActiveTokens(messages: Message[]): number {
  return messages
    .filter(m => !m.isPruned)
    .reduce((acc, m) => acc + (m.tokenCount || estimateTokens(m.content)), 0);
}

function applySlidingWindow(messages: Message[], contextMaxTokens: number): { prunedIds: string[]; remaining: Message[] } {
  const triggerThreshold = contextMaxTokens * 0.6;
  const targetThreshold = contextMaxTokens * 0.4;

  const activeMessages = messages.filter(m => !m.isPruned);
  const totalTokens = calculateActiveTokens(activeMessages);
  
  if (totalTokens <= triggerThreshold) {
    return { prunedIds: [], remaining: messages };
  }

  const sortedMessages = [...activeMessages].sort((a, b) => b.timestamp - a.timestamp);
  const prunedIds: string[] = [];
  const kept: Message[] = [];

  for (const msg of sortedMessages) {
    const currentTokens = calculateActiveTokens(kept);
    
    if (currentTokens < targetThreshold) {
      kept.push(msg);
    } else {
      prunedIds.push(msg.id);
    }
  }

  const keptIds = new Set(kept.map(m => m.id));
  return {
    prunedIds,
    remaining: messages.filter(m => keptIds.has(m.id) || m.isPruned)
  };
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

  const allMessages: Message[] = [...previousMessages, { role: 'user', content: input, timestamp: Date.now(), id: 'temp' }];
  
  const { contextMaxTokens } = useChatStore.getState();
  const { prunedIds, remaining: filteredMessages } = applySlidingWindow(allMessages, contextMaxTokens);
  
  if (prunedIds.length > 0) {
    store.setIsCompressing(true);
    store.pruneMessages(prunedIds);
    await new Promise(resolve => setTimeout(resolve, 300));
    store.setIsCompressing(false);
  }

  const messages = filteredMessages
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
        const { events, remaining: remBuffer } = parseSSEEvents(buffer);
        buffer = remBuffer;

        for (const event of events) {
          // Cast to any for backward compatibility with nested data format
          const e = event as { type: string; data?: unknown; module?: string; timestamp?: number };
          if (e.type === 'request' && (e.data as { request?: unknown })?.request) {
            const logId = `req-${Date.now()}`;
            requestLogId = logId;
            store.addRequestLog({
              id: logId,
              timestamp: startTime,
              type: 'request',
              data: (e.data as { request: unknown }).request,
            });
            store.updateLastMessageRequestLogId(logId);
          } else if (e.type === 'chunk' && (e.data as { chunk?: unknown })?.chunk) {
            const logId = `chunk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            responseLogIds.push(logId);
            const chunkData = (e.data as { chunk: unknown }).chunk;
            store.addRequestLog({
              id: logId,
              timestamp: Date.now(),
              type: 'response',
              data: chunkData,
            });

            const parsed = (chunkData as { raw?: string; parsed?: unknown }).parsed as {
              choices?: Array<{ delta?: { content?: string } }>;
            };

            if (parsed?.choices?.[0]?.delta?.content) {
              fullContent += parsed.choices[0].delta.content;
              store.setCurrentStreamContent(fullContent);
            }
          } else if (e.type === 'done') {
            totalUsage = (e.data as { usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } })?.usage;
          } else if (e.type === 'error') {
            throw new Error((e.data as { error?: string })?.error || 'Stream error');
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
