'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TOOL_COLORS } from '../lib/tools';
import type { Step } from '../lib/store';
import { AlertCircle } from 'lucide-react';

interface StepCardProps {
  step: Step;
  index: number;
  isHighlighted?: boolean;
  isActive?: boolean;
}

export function StepCard({ step, index, isHighlighted, isActive }: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      className={cn(
        'transition-all duration-300 cursor-pointer',
        isHighlighted && 'ring-2 ring-primary ring-offset-2',
        isActive && 'border-primary bg-primary/5'
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            Step {index + 1}
          </Badge>
          {step.isError && <AlertCircle className="h-4 w-4 text-destructive" />}
          {isExpanded ? (
            <span className="text-xs font-normal text-muted-foreground">点击收起</span>
          ) : (
            <span className="text-xs font-normal text-muted-foreground">点击展开</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Thought */}
        <div>
          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
            💭 Thought
          </div>
          <div
            className={cn(
              'text-sm bg-purple-50 dark:bg-purple-950/30 rounded-lg p-2',
              'border border-purple-200 dark:border-purple-800'
            )}
          >
            {isExpanded ? step.thought : (step.thought.slice(0, 100) + (step.thought.length > 100 ? '...' : ''))}
          </div>
        </div>

        {/* Action */}
        {step.action && (
          <div>
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
              🔧 Action
            </div>
            <div
              className={cn(
                'text-sm rounded-lg p-2 border-l-4 bg-blue-50 dark:bg-blue-950/30',
                TOOL_COLORS[step.action.toolName as keyof typeof TOOL_COLORS] || 'border-gray-500'
              )}
            >
              <div className="font-mono font-medium">{step.action.toolName}</div>
              <pre className="text-xs mt-1 overflow-x-auto whitespace-pre-wrap break-words">
                {JSON.stringify(step.action.arguments, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Observation */}
        {step.observation && (
          <div>
            <div
              className={cn(
                'text-xs font-medium mb-1',
                step.isError
                  ? 'text-destructive'
                  : 'text-green-600 dark:text-green-400'
              )}
            >
              {step.isError ? '⚠️ Observation (Error)' : '📤 Observation'}
            </div>
            <div
              className={cn(
                'text-sm rounded-lg p-2',
                step.isError
                  ? 'bg-destructive/10 border border-destructive/50'
                  : 'bg-green-50 dark:bg-green-950/30'
              )}
            >
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
                {isExpanded
                  ? step.observation
                  : step.observation.slice(0, 100) + (step.observation.length > 100 ? '...' : '')}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
