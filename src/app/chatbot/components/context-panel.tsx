'use client';

import { useChatStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { User, Bot, Settings, Loader2 } from 'lucide-react';

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

function calculateTotalTokens(messages: ReturnType<typeof useChatStore.getState>['messages']): number {
    return messages.reduce((acc, m) => acc + (m.tokenCount || estimateTokens(m.content)), 0);
}

function calculateActiveTokens(messages: ReturnType<typeof useChatStore.getState>['messages']): number {
    return messages
        .filter(m => !m.isPruned)
        .reduce((acc, m) => acc + (m.tokenCount || estimateTokens(m.content)), 0);
}

export function ContextPanel() {
    const { messages, modelParams, isCompressing, contextMaxTokens } = useChatStore();

    const currentTokens = calculateActiveTokens(messages);
    const usagePercent = contextMaxTokens > 0 ? (currentTokens / contextMaxTokens) * 100 : 0;
    const triggerPercent = 60;
    const isOverTrigger = usagePercent > triggerPercent;

    const roleIcons = {
        user: <User className="h-3 w-3" />,
        assistant: <Bot className="h-3 w-3" />,
        system: <Settings className="h-3 w-3" />,
    };

    const roleColors = {
        user: 'bg-primary text-primary-foreground',
        assistant: 'bg-muted',
        system: 'bg-secondary text-secondary-foreground',
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    历史消息处理：简单滑动窗口
                    {isCompressing && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            压缩中...
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">窗口使用率</span>
                        <span className={cn(
                            'font-mono font-medium',
                            isOverTrigger ? 'text-yellow-600' : ''
                        )}>
                            {usagePercent.toFixed(1)}%
                        </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full transition-all duration-300 rounded-full',
                                isOverTrigger ? 'bg-yellow-500' : 'bg-primary'
                            )}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-muted/50 rounded text-center">
                            <div className="font-mono font-medium">{currentTokens}</div>
                            <div className="text-muted-foreground">当前 tokens</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded text-center">
                            <div className="font-mono font-medium">{contextMaxTokens}</div>
                            <div className="text-muted-foreground">窗口容量</div>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                        触发阈值: {contextMaxTokens * triggerPercent / 100} tokens (60%)
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                        当前上下文内容： ({messages.length} 条)
                    </div>
                    <ScrollArea className="h-40 border rounded-md">
                        <div className="p-2 space-y-1">
                            {messages.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-4">暂无消息</p>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            'flex items-center gap-2 p-1.5 rounded text-xs',
                                            msg.isPruned
                                                ? 'bg-red-50 border border-red-200 text-red-600'
                                                : 'bg-muted/50'
                                        )}
                                    >
                                        <div className={cn('p-1 rounded', roleColors[msg.role])}>
                                            {roleIcons[msg.role]}
                                        </div>
                                        <span className="font-medium">{msg.role}</span>
                                        <span className="text-muted-foreground truncate flex-1">
                                            {msg.content.slice(0, 20)}...
                                        </span>
                                        <span className="font-mono text-muted-foreground">
                                            {msg.tokenCount || estimateTokens(msg.content)}
                                        </span>
                                        {msg.isPruned && (
                                            <span className="text-xs bg-red-100 px-1 rounded">已清理</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}
