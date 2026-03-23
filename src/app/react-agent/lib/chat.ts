import { useReactAgentStore } from './store';
import type { ToolName } from './tools';

interface SSEEvent {
  type: 'request' | 'thought' | 'thought_delta' | 'action' | 'observation' | 'final_answer' | 'done' | 'error';
  request?: unknown;
  thought?: string;
  delta?: string;
  toolName?: ToolName;
  arguments?: Record<string, unknown>;
  observation?: string;
  isError?: boolean;
  answer?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
  isIterationLimit?: boolean;
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
        if (event.type === 'thought' && event.thought) {
          store.appendThought(event.thought);
          // 检查 thought 内容是否包含最终答案
          const finalAnswerMatch = event.thought.match(/(?:最终答案|Final Answer)[:：]?\s*(.+)/i);
          if (finalAnswerMatch) {
            store.setFinalAnswer(finalAnswerMatch[1].trim());
          }
        } else if (event.type === 'thought_delta' && event.delta) {
          store.appendThought(event.delta);
        } else if (event.type === 'action' && event.toolName) {
          store.setAction(event.toolName, event.arguments || {});
        } else if (event.type === 'observation' && event.observation !== undefined) {
          store.setObservation(event.observation, event.isError);
        } else if (event.type === 'done') {
          store.completeExecution(event.usage);
        } else if (event.type === 'error') {
          store.failExecution(event.error || 'Unknown error');
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    store.failExecution(errorMessage);
  }
}
