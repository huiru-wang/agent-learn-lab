'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DocsPanel } from '../chatbot/components/docs-panel';
import { ServerPanel } from './components/server-panel';
import { McpList } from './components/mcp-list';
import { ChatArea } from './components/chat-area';
import { ExecutionTrace } from './components/execution-trace';

export default function MCPProtocolContent() {
  const [activeTab, setActiveTab] = useState('demo');

  return (
    <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)} className="flex flex-col h-screen overflow-hidden">
      <div className="border-b px-4 py-2 bg-muted/30">
        <TabsList className="h-9">
          <TabsTrigger value="demo" className="text-base font-medium">演示</TabsTrigger>
          <TabsTrigger value="docs" className="text-base font-medium">文档</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="demo" className="flex-1 m-0 p-0 overflow-hidden">
        <div className="flex h-full overflow-hidden">
          {/* 左侧：配置（上） + 会话（下） (60%) */}
          <div className="flex-1 flex flex-col min-w-0 border-r overflow-hidden" style={{ flexBasis: '60%', maxWidth: '60%' }}>
            {/* 上半部分：配置区（固定高度 45%） */}
            <div className="flex flex-col border-b bg-muted/5 overflow-hidden" style={{ height: '45%' }}>
              {/* Server Panel: 添加按钮 + 标签 */}
              <div className="px-4 pt-3 pb-2 flex-shrink-0">
                <ServerPanel />
              </div>
              {/* MCP Tools 列表：填满剩余空间，内部滚动 */}
              <div className="flex-1 min-h-0 px-4 pb-3">
                <McpList />
              </div>
            </div>

            {/* 下半部分：会话区（剩余空间） */}
            <div className="flex-1 overflow-hidden">
              <ChatArea />
            </div>
          </div>

          {/* 右侧：执行轨迹 (40%) */}
          <div className="flex-shrink-0 overflow-hidden" style={{ flexBasis: '40%', width: '40%' }}>
            <ExecutionTrace />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="docs" className="flex-1 m-0 p-0 overflow-hidden">
        <DocsPanel modulePath="/mcp-protocol" />
      </TabsContent>
    </Tabs>
  );
}
