'use client';

import { useChatStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TokenCounter() {
  const { messages, modelParams } = useChatStore();

  const inputTokens = messages.reduce((acc, m) => {
    if (m.role === 'user' || m.role === 'system') {
      return acc + (m.tokenCount || 0);
    }
    return acc;
  }, 0);

  const outputTokens = messages.reduce((acc, m) => {
    if (m.role === 'assistant') {
      return acc + (m.tokenCount || 0);
    }
    return acc;
  }, 0);

  const totalTokens = inputTokens + outputTokens;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Token 统计</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold font-mono">{inputTokens}</div>
            <div className="text-xs text-muted-foreground">输入 Tokens</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold font-mono">{outputTokens}</div>
            <div className="text-xs text-muted-foreground">输出 Tokens</div>
          </div>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <div className="text-2xl font-bold font-mono">{totalTokens}</div>
          <div className="text-xs text-muted-foreground">总计</div>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            模型限制: <span className="font-mono">{modelParams.maxTokens}</span> max tokens
          </p>
          <p>
            上下文窗口使用率:{' '}
            <span className="font-mono">
              {modelParams.maxTokens > 0
                ? ((totalTokens / modelParams.maxTokens) * 100).toFixed(1)
                : 0}
              %
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
