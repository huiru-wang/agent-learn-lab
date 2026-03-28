'use client';

import { useState } from 'react';
import { useIntentAgentStore, type Message, type RequestLog } from '../lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Bot, X, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
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
  const { requestLog } = useIntentAgentStore();

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
          ''
        )}
      >
        <div
          className={cn(
            'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
            message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}
        >
          {message.role === 'user' ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <div
          className={cn(
            'space-y-1 overflow-hidden',
            message.role === 'user' ? 'w-auto ml-auto' : 'flex-1 w-full'
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2 text-xs text-muted-foreground',
              ''
            )}
          >
            <span className="font-medium">{message.role}</span>
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            {message.role === 'user' && message.requestLogId && (
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
            {message.role === 'assistant' && message.responseLogIds && message.responseLogIds.length > 0 && (
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

          {message.role === 'user' ? (
            <MarkdownContent content={message.content} className="text-sm bg-primary/10 p-3 rounded-lg ml-auto" />
          ) : (
            <div className="space-y-2">
              {message.thinkingContent && (
                <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 mb-1.5">
                    💭 Thinking
                  </div>
                  <MarkdownContent content={message.thinkingContent} className="text-sm italic text-purple-700 dark:text-purple-300" />
                </div>
              )}
              <MarkdownContent content={message.content} className="text-sm" />
            </div>
          )}
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

function StreamingMessage() {
  const { currentThinkingContent, currentContentContent } = useIntentAgentStore();

  return (
    <div className="flex gap-3 p-4 rounded-lg">
      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-muted">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">assistant</span>
          <Loader2 className="h-3 w-3 animate-spin" />
        </div>

        {currentThinkingContent && (
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 mb-1.5">
              💭 Thinking
              {!currentContentContent && (
                <Loader2 className="h-3 w-3 animate-spin ml-1" />
              )}
            </div>
            <MarkdownContent content={currentThinkingContent} className="text-sm italic text-purple-700 dark:text-purple-300" />
          </div>
        )}

        {currentContentContent ? (
          <MarkdownContent content={currentContentContent} className="text-sm" />
        ) : !currentThinkingContent ? (
          <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            分析中...
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function MessageTimeline() {
  const { messages, isStreaming } = useIntentAgentStore();

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {messages.length === 0 && !isStreaming && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm mb-3">输入自然语言进行意图识别分析</p>
            </div>
          )}
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          {isStreaming && <StreamingMessage />}
        </div>
      </ScrollArea>
    </div>
  );
}
