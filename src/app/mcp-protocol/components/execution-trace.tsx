'use client';

import { useMCPStore } from '../lib/store';
import { TraceStep } from './trace-step';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Activity } from 'lucide-react';

export function ExecutionTrace() {
  const { callLogs, clearCallLogs } = useMCPStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">执行轨迹</span>
          {callLogs.length > 0 && (
            <span className="text-xs text-muted-foreground">({callLogs.length})</span>
          )}
        </div>
        {callLogs.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCallLogs}>
            <Trash2 className="h-3 w-3 mr-1" />
            清空
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {callLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无执行记录</p>
              <p className="text-xs mt-1">调用工具后将显示执行轨迹</p>
            </div>
          ) : (
            callLogs.map((log) => <TraceStep key={log.id} log={log} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
