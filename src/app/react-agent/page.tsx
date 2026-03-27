'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DocsPanel } from '../chatbot/components/docs-panel';
import { InputPanel } from './components/InputPanel';
import { ExecutionTrace } from './components/ExecutionTrace';
import { ServerPanel } from '../mcp-protocol/components/server-panel';
import { McpList } from '../mcp-protocol/components/mcp-list';
import { useReactAgentStore } from './lib/store';

export default function ReactAgentPage() {
  const [activeTab, setActiveTab] = useState('demo');
  const enabledTools = useReactAgentStore((state) => state.enabledTools);

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
            {/* 左侧: 输入区 */}
            <div className="flex-1 flex flex-col min-w-0 border-r overflow-hidden" style={{ flexBasis: '40%', maxWidth: '40%' }}>
              {/* 上半部分：MCP 服务器和工具（45% 高度） */}
              <div className="flex flex-col border-b bg-muted/5 overflow-hidden" style={{ height: '45%' }}>
                {/* ServerPanel: 添加按钮 + 标签 */}
                <div className="px-4 pt-3 pb-2 flex-shrink-0">
                  <ServerPanel />
                </div>
                {/* MCP Tools 列表：填满剩余空间，内部滚动 */}
                <div className="flex-1 min-h-0 px-4 pb-3">
                  <McpList
                  selectionMode={true}
                  selectedTools={enabledTools}
                  onToggleTool={(serverId, toolName) =>
                    useReactAgentStore.getState().toggleTool(`${serverId}:${toolName}`)
                  }
                />
                </div>
              </div>

              {/* 下半部分：任务输入 */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <InputPanel />
              </div>
            </div>

            {/* 右侧: 执行轨迹 */}
            <div className="flex-1 min-w-0" style={{ flexBasis: '60%' }}>
              <ExecutionTrace />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="flex-1 m-0 p-0 overflow-hidden">
          <DocsPanel modulePath="/react-agent" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
