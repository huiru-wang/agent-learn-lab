'use client';

import { useReactAgentStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function FinalAnswer() {
  const { trace } = useReactAgentStore();

  if (!trace.finalAnswer) return null;

  return (
    <Card className="border-green-500 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Final Answer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm whitespace-pre-wrap">{trace.finalAnswer}</div>
      </CardContent>
    </Card>
  );
}
