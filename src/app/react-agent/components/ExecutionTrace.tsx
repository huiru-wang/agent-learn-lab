'use client';

import { useReactAgentStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { TOOL_COLORS } from '../lib/tools';
import { cn } from '@/lib/utils';

function StepCard({ step, index, isActive, isHighlighted }: { step: { id: string; thought: string; action: { toolName: string; arguments: Record<string, unknown> } | null; observation: string | null; isError: boolean }; index: number; isActive: boolean; isHighlighted: boolean }) {
  return (
    <Card
      className={cn(
        'transition-all duration-300',
        isHighlighted && 'ring-2 ring-primary',
        isActive && 'border-primary'
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            Step {index + 1}
          </Badge>
          {step.isError && <AlertCircle className="h-4 w-4 text-destructive" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Thought */}
        <div>
          <div className="text-xs font-medium text-purple-600 mb-1">💭 Thought</div>
          <div className={cn(
            'text-sm bg-purple-50 dark:bg-purple-950/30 rounded-lg p-2',
            'border border-purple-200 dark:border-purple-800'
          )}>
            {step.thought}
          </div>
        </div>

        {/* Action */}
        {step.action && (
          <div>
            <div className="text-xs font-medium text-blue-600 mb-1">🔧 Action</div>
            <div className={cn(
              'text-sm rounded-lg p-2 border-l-4',
              TOOL_COLORS[step.action.toolName as keyof typeof TOOL_COLORS] || 'border-gray-500',
              'bg-blue-50 dark:bg-blue-950/30'
            )}>
              <div className="font-mono font-medium">{step.action.toolName}</div>
              <pre className="text-xs mt-1 overflow-x-auto">
                {JSON.stringify(step.action.arguments, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Observation / Final Answer */}
        {step.observation && (
          <div>
            <div className={cn(
              'text-xs font-medium mb-1',
              step.isError ? 'text-destructive' : 'text-green-600 dark:text-green-400'
            )}>
              {step.isError ? '⚠️ Observation (Error)' : step.action === null ? '✅ Final Answer' : '📤 Observation'}
            </div>
            <div className={cn(
              'text-sm rounded-lg p-2',
              step.isError ? 'bg-destructive/10 border border-destructive/50' : 'bg-green-50 dark:bg-green-950/30'
            )}>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {step.observation}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ExecutionTrace() {
  const { status, trace, currentStepIndex, currentThought, currentAction, currentObservation, error } = useReactAgentStore();

  const isReplaying = status === 'replaying';

  if (status === 'idle' && trace.steps.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center">
            <span className="text-2xl">🔄</span>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">等待执行</p>
            <p className="text-xs text-muted-foreground mt-1">
              在左侧输入任务并点击「执行」按钮
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-destructive/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive" />
            <p className="text-sm text-destructive font-medium">执行出错</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 border-b px-4 py-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">执行轨迹</h2>
          {status === 'running' && (
            <Badge variant="secondary" className="animate-pulse">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              执行中...
            </Badge>
          )}
          {status === 'paused' && (
            <Badge variant="outline">
              暂停于 Step {currentStepIndex + 1}
            </Badge>
          )}
          {status === 'done' && (
            <Badge variant="default">
              完成 ({trace.steps.length} 步)
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* 已完成的步骤 */}
          {trace.steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isActive={false}
              isHighlighted={isReplaying && currentStepIndex === index}
            />
          ))}

          {/* 当前执行中的步骤 */}
          {(status === 'running' || status === 'paused') && (currentThought || currentAction || currentObservation) && (
            <Card className="border-dashed border-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    Step {trace.steps.length + 1}
                  </Badge>
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentThought && (
                  <div>
                    <div className="text-xs font-medium text-purple-600 mb-1">💭 Thought</div>
                    <div className="text-sm bg-purple-50 dark:bg-purple-950/30 rounded-lg p-2 border border-purple-200 dark:border-purple-800 animate-pulse">
                      {currentThought}
                    </div>
                  </div>
                )}
                {currentAction && (
                  <div>
                    <div className="text-xs font-medium text-blue-600 mb-1">🔧 Action</div>
                    <div className={cn(
                      'text-sm rounded-lg p-2 border-l-4 bg-blue-50 dark:bg-blue-950/30',
                      TOOL_COLORS[currentAction.toolName as keyof typeof TOOL_COLORS] || 'border-gray-500'
                    )}>
                      <div className="font-mono font-medium">{currentAction.toolName}</div>
                      <pre className="text-xs mt-1 overflow-x-auto">
                        {JSON.stringify(currentAction.arguments, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                {currentObservation && (
                  <div>
                    <div className="text-xs font-medium text-green-600 mb-1">📤 Observation</div>
                    <div className="text-sm bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        {currentObservation}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Token 使用统计 */}
          {trace.totalTokens > 0 && (
            <div className="text-xs text-muted-foreground text-center">
              Token 使用: prompt={trace.promptTokens}, completion={trace.completionTokens}, total={trace.totalTokens}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
