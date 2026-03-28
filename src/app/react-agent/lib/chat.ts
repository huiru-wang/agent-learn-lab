import { useReactAgentStore } from './store';
import { parseSSEEvents } from '@/lib/chat-utils';

export async function sendExecutionMessage(input: string, modelId: string) {
  const store = useReactAgentStore.getState();

  store.startExecution();

  try {
    const response = await fetch('/react-agent/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: input,
        model: modelId,
        tools: store.enabledTools,
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const { events, remaining } = parseSSEEvents(buffer);
      buffer = remaining;

      for (const event of events) {
        // Cast to any for backward compatibility with module-specific event format
        const e = event as { type: string; thought?: string; delta?: string; toolName?: string; arguments?: Record<string, unknown>; observation?: string; isError?: boolean; answer?: string; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }; error?: string; module?: string; timestamp?: number };

        if (e.type === 'thought' && e.thought) {
          // thought 事件包含完整内容，直接替换（thought_delta 已累积相同内容）
          store.setThought(e.thought);
          // 检查 thought 内容是否包含最终答案
          const finalAnswerMatch = e.thought.match(/(?:最终答案|Final Answer)[:：]?\s*(.+)/i);
          if (finalAnswerMatch) {
            store.setFinalAnswer(finalAnswerMatch[1].trim());
          }
        } else if (e.type === 'thought_delta' && e.delta) {
          store.appendThought(e.delta);
        } else if (e.type === 'action' && e.toolName) {
          store.setAction(e.toolName, e.arguments || {});
        } else if (e.type === 'observation' && e.observation !== undefined) {
          store.setObservation(e.observation, e.isError);
        } else if (e.type === 'final_answer' && e.answer) {
          // 创建最终步骤（thought + final_answer，无 action）
          const currentThought = useReactAgentStore.getState().currentThought;
          store.createFinalStep(currentThought, e.answer);
        } else if (e.type === 'done') {
          store.completeExecution(e.usage);
        } else if (e.type === 'error') {
          store.failExecution(e.error || 'Unknown error');
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    store.failExecution(errorMessage);
  }
}
