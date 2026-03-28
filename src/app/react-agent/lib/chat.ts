import { useReactAgentStore } from './store';
import { useMCPStore } from '../../mcp-protocol/lib/store';
import { parseSSEEvents } from '@/lib/chat-utils';

export async function sendExecutionMessage(input: string, modelId: string) {
  const store = useReactAgentStore.getState();

  // 自动获取已连接的 MCP 服务器的工具
  const mcpStore = useMCPStore.getState();
  const connectedTools: string[] = [];

  if (mcpStore.connectionStatus === 'connected' && mcpStore.currentServerId) {
    const currentServerId = mcpStore.currentServerId;
    mcpStore.tools.forEach(t => {
      connectedTools.push(`${currentServerId}:${t.name}`);
    });
  }

  store.startExecution();

  try {
    const toolsToUse = connectedTools.length > 0 ? connectedTools : store.enabledTools;

    const response = await fetch('/react-agent/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: input,
        model: modelId,
        tools: toolsToUse,
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
        const e = event as {
          type: string;
          reasoning?: string;
          delta?: string;
          toolName?: string;
          arguments?: Record<string, unknown>;
          content?: string;
          isError?: boolean;
          answer?: string;
          usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
          error?: string;
        };

        if (e.type === 'reasoning') {
          // 完整的推理内容
          store.setThought(e.reasoning || '');
        } else if (e.type === 'reasoning_delta') {
          // 推理内容增量
          store.appendThought(e.delta || '');
        } else if (e.type === 'content_delta') {
          // 最终答案内容增量
          store.appendContent(e.delta || '');
        } else if (e.type === 'action' && e.toolName) {
          store.setAction(e.toolName, e.arguments || {});
        } else if (e.type === 'observation' && e.content !== undefined) {
          store.setObservation(e.content, e.isError);
        } else if (e.type === 'final_answer' && e.answer) {
          store.setFinalAnswer(e.answer);
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
