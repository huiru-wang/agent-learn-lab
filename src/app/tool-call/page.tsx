'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ToolList } from './components/tool-list';
import { ChatArea } from './components/chat-area';
import { ExecutionTrace } from './components/execution-trace';
import { DocsPanel } from '../chatbot/components/docs-panel';

export default function ToolCallPage() {
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
            {/* 左侧：工具卡片 + 聊天区 (50%) */}
            <div className="flex-1 flex flex-col min-w-0 border-r overflow-hidden" style={{ flexBasis: '50%', maxWidth: '50%' }}>
              {/* 工具卡片 */}
              <div className="px-4 pt-4 pb-3 border-b bg-muted/5 flex-shrink-0">
                <ToolList />
              </div>
              {/* 聊天区 */}
              <div className="flex-1 min-h-0">
                <ChatArea />
              </div>
            </div>

            {/* 右侧：执行轨迹 (50%) */}
            <div className="flex-1 min-w-0" style={{ flexBasis: '50%' }}>
              <ExecutionTrace />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="flex-1 m-0 p-0 overflow-hidden">
          <DocsPanel modulePath="/tool-call" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
