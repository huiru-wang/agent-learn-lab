'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { User, Bot, Loader2 } from 'lucide-react';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { LogDialog, type RequestLog } from './LogDialog';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    tokenCount?: number;
    requestLogId?: string;
    responseLogIds?: string[];
    isPruned?: boolean;
}

interface MessageItemProps {
    message: Message;
    requestLog?: RequestLog[];
    isStreaming?: boolean;
    currentStreamContent?: string;
}

const roleIcons = {
    user: <User className="h-4 w-4" />,
    assistant: <Bot className="h-4 w-4" />,
};

const roleColors = {
    user: 'bg-primary text-primary-foreground',
    assistant: 'bg-muted',
};

export function MessageItem({ message, requestLog = [], isStreaming = false, currentStreamContent }: MessageItemProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'request' | 'response'>('request');

    const relatedLogs = requestLog.filter((log) => {
        if (dialogType === 'request') {
            return log.id === message.requestLogId;
        }
        return message.responseLogIds?.includes(log.id);
    });

    // 流式消息显示
    if (isStreaming && message.role === 'assistant') {
        return (
            <div className="flex gap-3 p-4 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-muted">
                    <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1 w-full overflow-hidden">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">assistant</span>
                        <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                    {currentStreamContent ? (
                        <MarkdownContent content={currentStreamContent} className="text-sm w-full" />
                    ) : (
                        <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            生成中...
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className={cn(
                    'flex gap-3 p-4 rounded-lg transition-all',
                    message.isPruned && 'bg-red-50 border border-red-200'
                )}
            >
                <div
                    className={cn(
                        'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
                        roleColors[message.role]
                    )}
                >
                    {roleIcons[message.role]}
                </div>
                <div
                    className={cn(
                        'space-y-1 overflow-hidden',
                        message.role === 'user' ? 'w-auto ml-auto' : 'flex-1 w-full'
                    )}
                >
                    <div className={cn(
                        'flex items-center gap-2 text-xs',
                        message.isPruned ? 'text-red-600' : 'text-muted-foreground',
                        message.role === 'user' ? 'justify-end' : ''
                    )}>
                        {message.isPruned && (
                            <span className="bg-red-100 px-1.5 py-0.5 rounded text-red-600 text-xs">已清理</span>
                        )}
                        <span className="font-medium">{message.role}</span>
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.tokenCount && (
                            <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded",
                                message.isPruned ? "bg-red-100 text-red-600" : "bg-muted"
                            )}>
                                {message.tokenCount} tokens
                            </span>
                        )}
                        {!message.isPruned && message.role === 'user' && message.requestLogId && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-5 px-1.5 text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
                                onClick={() => {
                                    setDialogType('request');
                                    setDialogOpen(true);
                                }}
                            >
                                request
                            </Button>
                        )}
                        {!message.isPruned && message.role === 'assistant' && message.responseLogIds && message.responseLogIds.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-5 px-1.5 text-xs text-green-600 border-green-300 hover:bg-green-50"
                                onClick={() => {
                                    setDialogType('response');
                                    setDialogOpen(true);
                                }}
                            >
                                response
                            </Button>
                        )}
                    </div>
                    <MarkdownContent
                        content={message.content}
                        className={cn(
                            'text-sm',
                            message.role === 'user' ? 'bg-primary/10 p-3 rounded-lg ml-auto' : '',
                            message.isPruned && 'line-through decoration-red-400 text-red-400'
                        )}
                    />
                </div>
            </div>

            <LogDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                logs={relatedLogs}
                title={dialogType === 'request' ? 'Request Log' : 'Response Log'}
            />
        </>
    );
}
