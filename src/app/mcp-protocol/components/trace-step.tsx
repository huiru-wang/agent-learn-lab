'use client';

import { useState } from 'react';
import { useMCPStore, type CallLogEntry } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Toolbox,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface TraceStepProps {
  log: CallLogEntry;
}

function StepTypeIcon({ type }: { type: CallLogEntry['type'] }) {
  switch (type) {
    case 'tool_call':
      return <Toolbox className="h-4 w-4 text-orange-500" />;
    case 'tool_result':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'resource_read':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'prompt_get':
      return <FileText className="h-4 w-4 text-purple-500" />;
    default:
      return null;
  }
}

export function TraceStep({ log }: TraceStepProps) {
  const [showRequest, setShowRequest] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const hasRequest = !!log.detail.request;
  const hasResponse = !!log.detail.response;

  return (
    <>
      <Card className="mb-2">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <StepTypeIcon type={log.type} />
            <CardTitle className="text-sm font-medium">{log.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex gap-2">
          {hasRequest && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRequest(true)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Request
            </Button>
          )}
          {hasResponse && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResponse(true)}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <ArrowDownLeft className="h-3 w-3 mr-1" />
              Response
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRequest} onOpenChange={setShowRequest}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Request: {log.title}</DialogTitle>
          </DialogHeader>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(log.detail.request, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>

      <Dialog open={showResponse} onOpenChange={setShowResponse}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Response: {log.title}</DialogTitle>
          </DialogHeader>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(log.detail.response, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}
