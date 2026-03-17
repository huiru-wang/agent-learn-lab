import { useChatStore, type Message, type ModelParams } from './store';

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
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

  const messages = [...previousMessages, { role: 'user' as const, content: input }]
    .filter((m) => m.role !== 'system' || m.content)
    .map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }));

  store.addRequestLog({
    id: `req-${Date.now()}`,
    timestamp: startTime,
    type: 'request',
    data: {
      url: '/api/chat',
      body: {
        model: params.model,
        messages,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        topP: params.topP,
      },
    },
  });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: params.model,
        messages,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        topP: params.topP,
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
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      fullContent += text;
      store.setCurrentStreamContent(fullContent);
    }

    const tokenCount = estimateTokens(fullContent);

    store.addMessage({
      role: 'assistant',
      content: fullContent,
      tokenCount,
    });

    store.addRequestLog({
      id: `res-${Date.now()}`,
      timestamp: Date.now(),
      type: 'response',
      data: {
        content: fullContent,
        tokenCount,
      },
      duration: Date.now() - startTime,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    store.addMessage({
      role: 'assistant',
      content: `Error: ${errorMessage}`,
    });

    store.addRequestLog({
      id: `err-${Date.now()}`,
      timestamp: Date.now(),
      type: 'response',
      data: {
        error: errorMessage,
      },
      duration: Date.now() - startTime,
    });
  } finally {
    store.setIsStreaming(false);
    store.setCurrentStreamContent('');
  }
}
