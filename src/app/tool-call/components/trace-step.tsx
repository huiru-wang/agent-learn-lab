'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Check,
  Loader2,
  Circle,
  AlertCircle,
  Bot,
  Wrench,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import type { TraceStep, TraceStepStatus } from '../lib/store';

interface TraceStepProps {
  step: TraceStep;
  isLast: boolean;
}

function StepTypeIcon({
  stepType,
}: {
  stepType?: string;
}) {
  switch (stepType) {
    case 'llm_request':
    case 'llm_response':
      return <Bot className="h-3.5 w-3.5 text-blue-500" />;
    case 'tool_call':
      return <Wrench className="h-3.5 w-3.5 text-orange-500" />;
    case 'tool_call_result':
      return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
    default:
      return null;
  }
}

function StatusIcon({ status }: { status: TraceStepStatus }) {
  switch (status) {
    case 'completed':
      return (
        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Check className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      );
    case 'active':
      return (
        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
        </div>
      );
    case 'error':
      return (
        <div className="h-6 w-6 rounded-full bg-destructive flex items-center justify-center flex-shrink-0">
          <AlertCircle className="h-3.5 w-3.5 text-destructive-foreground" />
        </div>
      );
    case 'pending':
    default:
      return (
        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center flex-shrink-0">
          <Circle className="h-2.5 w-2.5 text-muted-foreground/30 fill-muted-foreground/30" />
        </div>
      );
  }
}

// ── Detail Dialog ─────────────────────────────────────────────────────────────
function DetailDialog({
  detail,
  onClose,
}: {
  detail: NonNullable<TraceStep['detail']>;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('request');

  const hasRequest = detail.request !== undefined;
  const hasResponse = detail.response !== undefined;

  const content =
    activeTab === 'request'
      ? hasRequest
        ? JSON.stringify(detail.request, null, 2)
        : '（无请求数据）'
      : hasResponse
      ? JSON.stringify(detail.response, null, 2)
      : '（无响应数据）';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 bg-background border rounded-lg shadow-xl flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <span className="text-sm font-semibold">详情</span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-1 px-4 pt-3 flex-shrink-0">
          {hasRequest && (
            <button
              onClick={() => setActiveTab('request')}
              className={cn(
                'px-3 py-1 text-xs rounded font-medium transition-colors',
                activeTab === 'request'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Request
            </button>
          )}
          {hasResponse && (
            <button
              onClick={() => setActiveTab('response')}
              className={cn(
                'px-3 py-1 text-xs rounded font-medium transition-colors',
                activeTab === 'response'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Response
            </button>
          )}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words bg-muted/40 rounded p-3">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ── TraceStepCard ─────────────────────────────────────────────────────────────
export function TraceStepCard({ step, isLast }: TraceStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const isActive = step.status === 'active';
  const isCompleted = step.status === 'completed';
  const isError = step.status === 'error';
  const isPending = step.status === 'pending';

  const stepType = step.detail?.stepType;

  // llm_request → Request 按钮；llm_response → Response 按钮
  const hasRequestBtn =
    isCompleted && step.detail?.request !== undefined;
  const hasResponseBtn =
    isCompleted && step.detail?.response !== undefined;
  const hasAnyDetailBtn = hasRequestBtn || hasResponseBtn;

  return (
    <>
      <div className="flex gap-3">
        {/* 左侧时间线 */}
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center flex-shrink-0">
            <StatusIcon status={step.status} />
            {/* stepType 图标叠加在右下角 */}
            {isCompleted && stepType && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-background rounded-full flex items-center justify-center">
                <StepTypeIcon stepType={stepType} />
              </div>
            )}
          </div>
          {!isLast && (
            <div
              className={cn(
                'w-0.5 flex-1 mt-1 min-h-4',
                isCompleted ? 'bg-primary/50' : 'bg-muted-foreground/20'
              )}
            />
          )}
        </div>

        {/* 右侧内容 */}
        <div
          className={cn(
            'flex-1 pb-4 rounded-lg px-3 py-2 mb-1 border transition-colors',
            isActive && 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800',
            isCompleted && 'border-primary/20 bg-primary/5',
            isError && 'border-destructive/30 bg-destructive/5',
            isPending && 'border-transparent bg-transparent'
          )}
        >
          {/* 标题行（含详情按钮） */}
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                'text-xs font-medium',
                isPending && 'text-muted-foreground',
                isActive && 'text-blue-700 dark:text-blue-300',
                isCompleted && 'text-foreground',
                isError && 'text-destructive'
              )}
            >
              {step.label}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {hasRequestBtn && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-5 px-1.5 text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
                  onClick={() => setDialogOpen(true)}
                >
                  <ArrowUpRight className="h-3 w-3" />
                  Request
                </Button>
              )}
              {hasResponseBtn && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-5 px-1.5 text-xs text-green-600 border-green-300 hover:bg-green-50"
                  onClick={() => setDialogOpen(true)}
                >
                  <ArrowDownLeft className="h-3 w-3" />
                  Response
                </Button>
              )}
            </div>
          </div>

          {step.content && (
            <pre className="mt-1.5 text-xs text-muted-foreground whitespace-pre-wrap break-words font-mono bg-muted/50 rounded px-2 py-1.5 max-h-32 overflow-y-auto">
              {step.content}
            </pre>
          )}
        </div>
      </div>

      {/* Dialog */}
      {dialogOpen && step.detail && (
        <DetailDialog
          detail={step.detail}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}
