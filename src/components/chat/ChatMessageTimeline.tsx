'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot } from 'lucide-react';
import { MessageItem } from './MessageItem';
import type { RequestLog } from './LogDialog';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    tokenCount?: number;
    requestLogId?: string;
    responseLogIds?: string[];
    isPruned?: boolean;
}

interface ChatMessageTimelineProps {
    messages: ChatMessage[];
    requestLog?: RequestLog[];
    isStreaming?: boolean;
    currentStreamContent?: string;
    emptyText?: string;
    emptySubText?: string;
}

export function ChatMessageTimeline({
    messages,
    requestLog = [],
    isStreaming = false,
    currentStreamContent,
    emptyText = '暂无消息',
    emptySubText = '发送一条消息开始对话',
}: ChatMessageTimelineProps) {
    return (
        <div className="flex flex-col min-h-0 flex-1">
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-4">
                    {messages.length === 0 && !isStreaming && (
                        <div className="text-center text-muted-foreground py-8">
                            <Bot className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">{emptyText}</p>
                            {emptySubText && <p className="text-xs mt-1">{emptySubText}</p>}
                        </div>
                    )}
                    {messages.map((message) => (
                        <MessageItem
                            key={message.id}
                            message={message}
                            requestLog={requestLog}
                        />
                    ))}
                    {isStreaming && (
                        <MessageItem
                            message={{
                                id: 'streaming',
                                role: 'assistant',
                                content: currentStreamContent || '',
                                timestamp: Date.now(),
                            }}
                            requestLog={requestLog}
                            isStreaming={true}
                            currentStreamContent={currentStreamContent}
                        />
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
