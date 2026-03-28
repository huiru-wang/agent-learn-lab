'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export interface RequestLog {
    id: string;
    timestamp: number;
    type: 'request' | 'response';
    data: unknown;
    duration?: number;
}

interface LogDialogProps {
    isOpen: boolean;
    onClose: () => void;
    logs: RequestLog[];
    title: string;
}

export function LogDialog({ isOpen, onClose, logs, title }: LogDialogProps) {
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
