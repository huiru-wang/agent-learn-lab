'use client';

import { useIntentAgentStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Target,
  Table2,
  BarChart3,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ConfidenceBar({ confidence, size = 'normal' }: { confidence: number; size?: 'normal' | 'small' }) {
  const percentage = Math.round(confidence * 100);
  const color =
    percentage >= 80
      ? 'bg-green-500'
      : percentage >= 60
        ? 'bg-yellow-500'
        : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex-1 rounded-full bg-muted overflow-hidden',
          size === 'small' ? 'h-1.5' : 'h-2.5'
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={cn(
          'font-mono font-medium tabular-nums',
          size === 'small' ? 'text-xs' : 'text-sm',
          percentage >= 80
            ? 'text-green-600'
            : percentage >= 60
              ? 'text-yellow-600'
              : 'text-red-600'
        )}
      >
        {percentage}%
      </span>
    </div>
  );
}

export function ResultPanel() {
  const { result, error, isStreaming } = useIntentAgentStore();

  if (isStreaming) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">正在分析意图...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="max-w-sm w-full border-destructive/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive" />
            <p className="text-sm text-destructive font-medium">分析出错</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Target className="h-10 w-10 mx-auto text-muted-foreground/30" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              等待分析
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              在左侧输入文本并点击「分析」按钮
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* 主意图 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              主意图
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                {result.primaryIntent.name}
              </code>
              <span className="text-sm font-medium">
                {result.primaryIntent.label}
              </span>
            </div>
            <ConfidenceBar confidence={result.primaryIntent.confidence} />
          </CardContent>
        </Card>

        {/* 槽位提取 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Table2 className="h-4 w-4 text-primary" />
              槽位提取
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.slots.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                未提取到槽位信息
              </p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                        槽位
                      </th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                        提取值
                      </th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                        归一化
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.slots.map((slot, idx) => (
                      <tr
                        key={slot.name}
                        className={cn(
                          idx % 2 === 0 ? '' : 'bg-muted/20'
                        )}
                      >
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <code className="text-xs font-mono">
                              {slot.name}
                            </code>
                            <span className="text-[10px] text-muted-foreground">
                              {slot.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {slot.value}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {slot.normalized ? (
                            <Badge variant="secondary" className="text-xs">
                              {slot.normalized}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 全部意图排名 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              全部意图排名
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.allIntents.map((intent, idx) => (
              <div key={intent.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4 text-right">
                      {idx + 1}.
                    </span>
                    <code className="font-mono">{intent.name}</code>
                    <span className="text-muted-foreground">
                      ({intent.label})
                    </span>
                  </div>
                </div>
                <div className="pl-6">
                  <ConfidenceBar
                    confidence={intent.confidence}
                    size="small"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </ScrollArea>
  );
}
