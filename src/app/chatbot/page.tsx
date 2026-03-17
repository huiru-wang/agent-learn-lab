'use client';

import { MessageTimeline } from './components/message-timeline';
import { ParamControls } from './components/param-controls';
import { ContextPanel } from './components/context-panel';
import { InputPanel } from './components/input-panel';
import { Card, CardContent } from '@/components/ui/card';

export default function ChatbotPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 border-r">
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold">01</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold">Chatbot</h1>
              <p className="text-sm text-muted-foreground truncate">
                Messages 结构、模型参数、Streaming 流式响应
              </p>
            </div>
          </div>
        </div>

        <MessageTimeline />
        <InputPanel />
      </div>

      <div className="w-80 border-l bg-muted/5 overflow-y-auto shrink-0">
        <div className="p-4 space-y-4">
          <ParamControls />
          <ContextPanel />
        </div>
      </div>
    </div>
  );
}
