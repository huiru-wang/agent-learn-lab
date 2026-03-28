import type { ChatSSEEvent } from './chat-types';

/**
 * Parse SSE events from a text buffer.
 * Returns parsed events and any remaining unparsed text.
 */
export function parseSSEEvents(text: string): { events: ChatSSEEvent[]; remaining: string } {
  const events: ChatSSEEvent[] = [];
  const lines = text.split('\n');
  let remaining = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('data: ')) {
      try {
        const data = line.slice(6);
        if (data.trim()) {
          const event = JSON.parse(data) as ChatSSEEvent;
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

/**
 * Create a ReadableStream from an async generator of ChatSSEEvents.
 */
export function createSSEStream(
  generator: AsyncGenerator<ChatSSEEvent>
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Create a helper to send SSE events with consistent formatting.
 */
export function createSSEEmitter(controller: ReadableStreamDefaultController) {
  const encoder = new TextEncoder();

  return function send(event: ChatSSEEvent) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  };
}

/**
 * Create a timestamp for SSE events.
 */
export function createTimestamp(): number {
  return Date.now();
}
