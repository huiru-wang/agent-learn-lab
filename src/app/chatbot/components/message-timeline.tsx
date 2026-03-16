'use client';

import { useChatStore, type Message } from '../lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { User, Bot, Settings } from 'lucide-react';

function MessageItem({ message }: { message: Message }) {
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

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        message.role === 'user' ? 'flex-row-reverse' : ''
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
          'flex-1 space-y-1',
          message.role === 'user' ? 'text-right' : ''
        )}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{message.role}</span>
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {message.tokenCount && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {message.tokenCount} tokens
            </span>
          )}
        </div>
        <div
          className={cn(
            'text-sm whitespace-pre-wrap',
            message.role === 'user' ? 'bg-primary/10 p-3 rounded-lg inline-block' : ''
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

export function MessageTimeline() {
  const { messages, isStreaming, currentStreamContent } = useChatStore();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b bg-muted/30">
        <h3 className="font-medium text-sm">消息时间线</h3>
        <p className="text-xs text-muted-foreground">
          展示完整的对话历史和消息结构
        </p>
      </div>
      <ScrollArea className="flex-1">
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
