'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { IntentList } from './components/intent-list';
import { ChatPanel } from './components/chat-panel';
import { ResultPanel } from './components/result-panel';
import { DocsPanel } from '../chatbot/components/docs-panel';

export default function IntentAgentPage() {
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
                        {/* 左侧 (50%): 上半意图列表 + 下半聊天区 */}
                        <div className="flex-1 flex flex-col min-w-0 border-r overflow-hidden" style={{ flexBasis: '50%', maxWidth: '50%' }}>
                            {/* 上半部分：预定义意图列表（auto 高度） */}
                            <div className="flex flex-col min-h-0 border-b bg-muted/5 overflow-hidden shrink-0">
                                <div className="px-4 pt-3 pb-0 shrink-0">
                                    预定义以下5个意图以及意图数据提取
                                </div>
                                <div className="px-4 p-3">
                                    <IntentList />
                                </div>
                            </div>

                            {/* 下半部分：聊天区 */}
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <ChatPanel />
                            </div>
                        </div>

                        {/* 右侧 (50%): 分析结果 */}
                        <div className="shrink-0 overflow-hidden" style={{ flexBasis: '50%', width: '50%' }}>
                            <ResultPanel />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="docs" className="flex-1 m-0 p-0 overflow-hidden">
                    <DocsPanel modulePath="/intent-agent" />
                </TabsContent>
            </Tabs>
        </div>
    );
}
