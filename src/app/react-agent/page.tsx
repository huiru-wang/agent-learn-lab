'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DocsPanel } from '../chatbot/components/docs-panel';
import { InputPanel } from './components/InputPanel';
import { ExecutionTrace } from './components/ExecutionTrace';

export default function ReactAgentPage() {
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
            {/* 左侧: 输入区 */}
            <div className="flex-1 flex flex-col min-w-0 border-r overflow-hidden" style={{ flexBasis: '40%', maxWidth: '40%' }}>
              {/* 工具选择 */}
              <div className="flex-shrink-0 border-b bg-muted/5 p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span>🔧</span> 可用工具
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-blue-500 text-blue-500" />
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="font-mono">weather_api</span>
                    <span className="text-muted-foreground text-xs">查询城市天气</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-green-500 text-green-500" />
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="font-mono">calculator</span>
                    <span className="text-muted-foreground text-xs">数学计算</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-orange-500 text-orange-500" />
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span className="font-mono">search</span>
                    <span className="text-muted-foreground text-xs">网络搜索</span>
                  </label>
                </div>
              </div>

              {/* 输入面板 */}
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
