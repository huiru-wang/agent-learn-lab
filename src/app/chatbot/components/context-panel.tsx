'use client';

import { useState } from 'react';
import { useChatStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Zap, AlertTriangle, User, Bot, Settings, FileText, Loader2 } from 'lucide-react';
import { estimateTokens, getCompressionModeLabel } from '../lib/compression';

export function ContextPanel() {
  const {
    messages,
    compressedMessages,
    contextLimit,
    modelParams,
    isCompressing,
    setIsCompressing,
    applyCompression
  } = useChatStore();
  const [showMessages, setShowMessages] = useState(true);
  const [showCompressed, setShowCompressed] = useState(false);

  const inputTokens = messages.reduce((acc, m) => {
    if (m.role === 'user' || m.role === 'system') {
      return acc + (m.tokenCount || estimateTokens(m.content));
    }
    return acc;
  }, 0);

  const outputTokens = messages.reduce((acc, m) => {
    if (m.role === 'assistant') {
      return acc + (m.tokenCount || estimateTokens(m.content));
    }
    return acc;
  }, 0);

  const totalTokens = inputTokens + outputTokens;
  const compressedTokens = compressedMessages.reduce((acc, m) => acc + m.originalTokenCount, 0);
  const savedTokens = compressedTokens - compressedMessages.reduce((acc, m) => acc + m.tokenCount, 0);
  const usagePercent = contextLimit > 0 ? (totalTokens / contextLimit) * 100 : 0;

  const isWarning = usagePercent > 80;
  const isCritical = usagePercent > 95;

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

  const handleCompress = async () => {
    if (messages.length === 0 || isCompressing) return;

    setIsCompressing(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const { compressMessages } = await import('../lib/compression');
    const result = compressMessages(messages, modelParams.compressionMode, contextLimit);

    applyCompression(result.messages, result.compressedMessages);
    setIsCompressing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          上下文模块
          {isCritical && (
            <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              即将溢出
            </span>
          )}
        </CardTitle>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          当前压缩方式：{getCompressionModeLabel(modelParams.compressionMode)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">窗口使用率</span>
            <span className={cn(
              'font-mono font-medium',
              isCritical ? 'text-destructive' : isWarning ? 'text-yellow-600' : ''
            )}>
              {usagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300 rounded-full',
                isCritical ? 'bg-destructive' : isWarning ? 'bg-yellow-500' : 'bg-primary'
              )}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-muted/50 rounded text-center">
              <div className="font-mono font-medium">{inputTokens}</div>
              <div className="text-muted-foreground">输入</div>
            </div>
            <div className="p-2 bg-muted/50 rounded text-center">
              <div className="font-mono font-medium">{outputTokens}</div>
              <div className="text-muted-foreground">输出</div>
            </div>
            <div className="p-2 bg-muted/50 rounded text-center">
              <div className="font-mono font-medium">{contextLimit}</div>
              <div className="text-muted-foreground">窗口大小</div>
            </div>
          </div>
          {compressedMessages.length > 0 && (
            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs">
              <div className="flex items-center justify-between">
                <span className="text-green-700">已压缩 {compressedMessages.length} 组消息</span>
                <span className="text-green-600 font-mono">节省 {savedTokens} tokens</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
          >
            <span>当前上下文 ({messages.length} 条)</span>
            {showMessages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showMessages && (
            <ScrollArea className="h-32 border rounded-md">
              <div className="p-2 space-y-1">
                {messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">暂无消息</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex items-center gap-2 p-1.5 rounded text-xs',
                        msg.isSummary ? 'bg-blue-500/10 border border-blue-500/20' :
                          msg.isCompressed ? 'bg-gray-500/10 border border-gray-500/20 opacity-60' : 'bg-muted/50'
                      )}
                    >
                      <div className={cn('p-1 rounded', roleColors[msg.role])}>
                        {msg.isSummary ? <FileText className="h-3 w-3 text-blue-500" /> : roleIcons[msg.role]}
                      </div>
                      <span className="font-medium">{msg.role}</span>
                      <span className="text-muted-foreground truncate flex-1">
                        {truncate(msg.content, 30)}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {msg.tokenCount || estimateTokens(msg.content)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {compressedMessages.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowCompressed(!showCompressed)}
              className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
            >
              <span className="text-blue-600">压缩预览</span>
              {showCompressed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showCompressed && (
              <ScrollArea className="h-40 border rounded-md">
                <div className="p-2 space-y-2">
                  {compressedMessages.map((cm) => (
                    <div key={cm.id} className="p-2 bg-blue-500/5 border border-blue-500/20 rounded text-xs space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>压缩了 {cm.originalIds.length} 条消息</span>
                        <span className="font-mono">
                          {cm.originalTokenCount} → {cm.tokenCount} tokens
                        </span>
                      </div>
                      <p className="text-foreground/80 line-clamp-3">{cm.summary}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={handleCompress}
            disabled={messages.length === 0 || isCompressing}
          >
            {isCompressing ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                压缩中...
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-1" />
                手动压缩
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}
