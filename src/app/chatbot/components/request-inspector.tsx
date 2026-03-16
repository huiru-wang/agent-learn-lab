'use client';

import { useChatStore, type RequestLog } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

function LogItem({ log }: { log: RequestLog }) {
  const isRequest = log.type === 'request';

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRequest ? (
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          ) : (
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          )}
          <Badge variant={isRequest ? 'default' : 'secondary'}>
            {isRequest ? 'Request' : 'Response'}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
      </div>
      {log.duration && (
        <div className="text-xs text-muted-foreground">
          耗时: {log.duration}ms
        </div>
      )}
      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
        <code>{JSON.stringify(log.data, null, 2)}</code>
      </pre>
    </div>
  );
}

export function RequestInspector() {
  const { requestLog } = useChatStore();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">请求/响应日志</CardTitle>
        <p className="text-xs text-muted-foreground">
          查看完整的 API 交互细节
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-3">
            {requestLog.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                <p className="text-xs">暂无请求记录</p>
              </div>
            ) : (
              requestLog.map((log) => <LogItem key={log.id} log={log} />)
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
