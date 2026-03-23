'use client';

import { useReactAgentStore } from '../lib/store';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, Square } from 'lucide-react';

export function DebugControls() {
  const {
    status,
    trace,
    currentStepIndex,
    replaySpeed,
    startReplay,
    stopReplay,
    stepForward,
    setReplaySpeed,
  } = useReactAgentStore();

  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isDone = status === 'done';
  const isReplaying = status === 'replaying';
  const hasSteps = trace.steps.length > 0;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <span>⚡</span> 调试控制
      </h3>

      {/* 进度指示 */}
      {hasSteps && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: isReplaying
                  ? `${((currentStepIndex + 1) / trace.steps.length) * 100}%`
                  : '100%',
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {isReplaying
              ? `Step ${currentStepIndex + 1}/${trace.steps.length}`
              : `${trace.steps.length} 步`}
          </span>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex gap-2 flex-wrap">
        {/* 单步执行按钮 - 仅在暂停时显示 */}
        {isPaused && (
          <Button
            size="sm"
            variant="outline"
            onClick={stepForward}
            disabled={currentStepIndex >= trace.steps.length - 1}
          >
            <SkipForward className="h-4 w-4 mr-1" />
            下一步
          </Button>
        )}

        {/* 继续执行按钮 - 仅在暂停时显示 */}
        {isPaused && (
          <Button
            size="sm"
            onClick={() => useReactAgentStore.getState().resumeExecution()}
          >
            <Play className="h-4 w-4 mr-1" />
            继续
          </Button>
        )}

        {/* 暂停按钮 - 仅在运行时显示 */}
        {isRunning && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => useReactAgentStore.getState().pauseExecution()}
          >
            <Pause className="h-4 w-4 mr-1" />
            暂停
          </Button>
        )}

        {/* 回放按钮 - 仅在完成时显示 */}
        {isDone && !isReplaying && (
          <Button size="sm" variant="outline" onClick={startReplay}>
            <RotateCcw className="h-4 w-4 mr-1" />
            回放
          </Button>
        )}

        {/* 停止回放按钮 - 仅在回放时显示 */}
        {isReplaying && (
          <Button size="sm" variant="destructive" onClick={stopReplay}>
            <Square className="h-4 w-4 mr-1" />
            停止
          </Button>
        )}
      </div>

      {/* 回放速度选择 - 仅在有步骤时显示 */}
      {hasSteps && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">速度:</span>
          <div className="flex gap-1">
            {[0.5, 1, 2].map((speed) => (
              <Button
                key={speed}
                size="sm"
                variant={replaySpeed === speed ? 'default' : 'outline'}
                className="h-7 px-2 text-xs"
                onClick={() => setReplaySpeed(speed)}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 状态信息 */}
      <div className="text-xs text-muted-foreground">
        状态:{' '}
        <span className="font-medium">
          {status === 'idle' && '空闲'}
          {status === 'running' && '执行中'}
          {status === 'paused' && '已暂停'}
          {status === 'done' && '已完成'}
          {status === 'replaying' && '回放中'}
          {status === 'error' && '错误'}
        </span>
      </div>
    </div>
  );
}
