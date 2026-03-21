'use client';

import { useState } from 'react';
import { useMCPStore } from '../lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, FileText, MessageSquare } from 'lucide-react';

interface InteractionPanelProps {
  onExecuteTool: (toolName: string, args: Record<string, unknown>) => void;
  onReadResource: (uri: string) => void;
  onGetPrompt: (name: string, args: Record<string, unknown>) => void;
  executingToolName: string | null;
}

export function InteractionPanel({
  onExecuteTool,
  onReadResource,
  onGetPrompt,
  executingToolName,
}: InteractionPanelProps) {
  const { connectionStatus, currentSessionId, addCallLog } = useMCPStore();

  // Generic tool execution (for quick testing)
  const [quickToolName, setQuickToolName] = useState('');
  const [quickArgs, setQuickArgs] = useState('');

  const handleQuickExecute = () => {
    if (!quickToolName) return;

    let args: Record<string, unknown> = {};
    if (quickArgs.trim()) {
      try {
        args = JSON.parse(quickArgs);
      } catch {
        // If not JSON, treat as single string argument
        args = { input: quickArgs };
      }
    }

    onExecuteTool(quickToolName, args);
    setQuickToolName('');
    setQuickArgs('');
  };

  // Resource reading
  const [resourceUri, setResourceUri] = useState('');

  const handleReadResource = () => {
    if (!resourceUri) return;
    onReadResource(resourceUri);
  };

  // Prompt getting
  const [promptName, setPromptName] = useState('');
  const [promptArgs, setPromptArgs] = useState('');

  const handleGetPrompt = () => {
    if (!promptName) return;

    let args: Record<string, unknown> = {};
    if (promptArgs.trim()) {
      try {
        args = JSON.parse(promptArgs);
      } catch {
        args = {};
      }
    }

    onGetPrompt(promptName, args);
  };

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">连接 Server 后使用交互功能</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Tool Executor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Play className="h-4 w-4" />
            快速执行工具
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="quick-tool-name" className="text-xs">工具名</Label>
            <Input
              id="quick-tool-name"
              placeholder="例如：get_time"
              value={quickToolName}
              onChange={(e) => setQuickToolName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="quick-args" className="text-xs">参数 (JSON)</Label>
            <Input
              id="quick-args"
              placeholder='{"timezone": "Asia/Shanghai"}'
              value={quickArgs}
              onChange={(e) => setQuickArgs(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleQuickExecute} disabled={!quickToolName || !!executingToolName}>
            <Play className="h-3 w-3 mr-1" />
            执行
          </Button>
        </CardContent>
      </Card>

      {/* Quick Resource Reader */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            读取资源
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="resource-uri" className="text-xs">Resource URI</Label>
            <Input
              id="resource-uri"
              placeholder="例如：file://config.json"
              value={resourceUri}
              onChange={(e) => setResourceUri(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleReadResource} disabled={!resourceUri}>
            <FileText className="h-3 w-3 mr-1" />
            读取
          </Button>
        </CardContent>
      </Card>

      {/* Quick Prompt Getter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            获取提示词
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="prompt-name" className="text-xs">Prompt 名称</Label>
            <Input
              id="prompt-name"
              placeholder="例如：code_review"
              value={promptName}
              onChange={(e) => setPromptName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prompt-args" className="text-xs">变量 (JSON)</Label>
            <Input
              id="prompt-args"
              placeholder='{"language": "python"}'
              value={promptArgs}
              onChange={(e) => setPromptArgs(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleGetPrompt} disabled={!promptName}>
            <MessageSquare className="h-3 w-3 mr-1" />
            获取
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
