'use client';

import { useState } from 'react';
import { MessageTimeline } from './components/message-timeline';
import { ParamControls } from './components/param-controls';
import { ContextPanel } from './components/context-panel';
import { InputPanel } from './components/input-panel';
import { DocsPanel } from './components/docs-panel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ChatbotPage() {
  const [activeTab, setActiveTab] = useState('demo');

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="border-b px-4 py-2 bg-muted/30">
          <TabsList className="h-9">
            <TabsTrigger value="demo" className="text-base font-medium">演示</TabsTrigger>
            <TabsTrigger value="docs" className="text-base font-medium">文档</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="demo" className="flex-1 m-0 p-0 overflow-hidden">
          <div className="flex h-full overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 border-r overflow-hidden">
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
        </TabsContent>

        <TabsContent value="docs" className="flex-1 m-0 p-0 overflow-hidden">
          <DocsPanel modulePath="/chatbot" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
