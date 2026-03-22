'use client';

import { useMCPStore } from '../lib/store';
import { TraceStepCard } from './trace-step';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from 'lucide-react';

export function ExecutionTrace() {
  const { trace } = useMCPStore();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">执行轨迹</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">实时展示工具调用全过程</p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4">
          {trace.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">发送消息后，执行轨迹将在这里实时展示</p>
              <p className="text-xs mt-1 opacity-70">连接 MCP Server 后开始对话</p>
            </div>
          ) : (
            <div>
              {trace.map((step, index) => (
                <TraceStepCard
                  key={step.id}
                  step={step}
                  isLast={index === trace.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
