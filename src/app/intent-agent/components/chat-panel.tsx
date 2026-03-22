'use client';

import { MessageTimeline } from './message-timeline';
import { InputPanel } from './input-panel';

export function ChatPanel() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <MessageTimeline />
      <InputPanel />
    </div>
  );
}
