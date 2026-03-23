'use client';

import { Card, CardContent } from '@/components/ui/card';

export function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
            <span className="text-2xl">🔄</span>
          </div>
          <h3 className="font-medium text-muted-foreground">等待执行</h3>
          <p className="text-sm text-muted-foreground mt-2">
            在左侧输入任务描述，然后点击「执行」按钮开始 ReAct Agent 执行
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
