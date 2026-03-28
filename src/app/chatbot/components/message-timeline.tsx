'use client';

import { useState } from 'react';
import { useChatStore, type Message, type RequestLog } from '../lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Bot, Settings, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { MarkdownContent } from '@/components/ui/markdown-content';

interface LogDialogProps {
    isOpen: boolean;
    onClose: () => void;
    logs: RequestLog[];
    title: string;
}

function LogDialog({ isOpen, onClose, logs, title }: LogDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 bg-background border rounded-lg shadow-lg w-[700px] h-[500px] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
                    <h3 className="font-medium">{title}</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {logs.length === 0 ? (
                        <div className="text-center text-muted-foreground py-4">
                            <p className="text-xs">暂无日志</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {log.type === 'request' ? (
                                            <ArrowUpRight className="h-4 w-4 text-blue-500" />
                                        ) : (
                                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                        )}
                                        <span className="text-xs font-medium">
                                            {log.type === 'request' ? 'Request' : 'Response'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        {log.duration && <span>{log.duration}ms</span>}
                                    </div>
                                </div>
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-[300px] overflow-y-auto">
                                    <code>{JSON.stringify(log.data, null, 2)}</code>
                                </pre>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function MessageItem({ message }: { message: Message }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'request' | 'response'>('request');
    const { requestLog } = useChatStore();

    const roleIcons = {
        user: <User className="h-4 w-4" />,
        assistant: <Bot className="h-4 w-4" />,
        system: <Settings className="h-4 w-4" />,
    };

    const roleColors = {
        user: 'bg-primary text-primary-foreground',
        assistant: 'bg-muted',
        system: 'bg-secondary text-secondary-foreground',
    };

    const relatedLogs = requestLog.filter((log) => {
        if (dialogType === 'request') {
            return log.id === message.requestLogId;
        }
        return message.responseLogIds?.includes(log.id);
    });

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
                        message.isPruned ? 'bg-red-400 text-white' : roleColors[message.role]
                    )}
                >
                    {message.isPruned ? <X className="h-4 w-4" /> : roleIcons[message.role]}
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
                        ''
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

export function MessageTimeline() {
    const { messages, isStreaming, currentStreamContent } = useChatStore();

    return (
        <div className="flex flex-col min-h-0 flex-1">
            {/* <div className="px-4 py-2 border-b bg-muted/30 flex-shrink-0"> */}
            {/*   <h3 className="font-medium text-sm">消息时间线: 点击「request」、「response」查看请求细节</h3> */}
            {/* </div> */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-4">
                    {messages.length === 0 && !isStreaming && (
                        <div className="text-center text-muted-foreground py-8">
                            <p className="text-sm">暂无消息</p>
                            <p className="text-xs mt-1">发送一条消息开始对话</p>
                        </div>
                    )}
                    {messages.map((message) => (
                        <MessageItem key={message.id} message={message} />
                    ))}
                    {isStreaming && currentStreamContent && (
                        <MessageItem
                            message={{
                                id: 'streaming',
                                role: 'assistant',
                                content: currentStreamContent,
                                timestamp: Date.now(),
                            }}
                        />
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
