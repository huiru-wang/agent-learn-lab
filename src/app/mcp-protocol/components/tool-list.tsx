'use client';

import { useState } from 'react';
import { useMCPStore, type MCPTool } from '../lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight, Wrench, Play } from 'lucide-react';

interface ToolCardProps {
  tool: MCPTool;
  onExecute: (toolName: string, args: Record<string, unknown>) => void;
  isExecuting: boolean;
}

function ToolCard({ tool, onExecute, isExecuting }: ToolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [args, setArgs] = useState<Record<string, string>>({});

  const schema = tool.inputSchema as {
    type?: string;
    properties?: Record<string, { type?: string; description?: string; default?: unknown }>;
    required?: string[];
  };

  const properties = schema?.properties || {};

  const handleExecute = () => {
    const parsedArgs: Record<string, unknown> = {};
    Object.entries(args).forEach(([key, value]) => {
      // Try to parse JSON, otherwise use as string
      try {
        parsedArgs[key] = JSON.parse(value);
      } catch {
        parsedArgs[key] = value;
      }
    });
    onExecute(tool.name, parsedArgs);
  };

  return (
    <Card className="mb-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => setIsExpanded(!isExpanded)}>
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{tool.name}</CardTitle>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {!isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
            >
              展开
            </Button>
          )}
        </div>
        {tool.description && (
          <CardDescription className="mt-1 line-clamp-2">{tool.description}</CardDescription>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {Object.keys(properties).length > 0 ? (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">参数</Label>
              {Object.entries(properties).map(([key, prop]) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`${tool.name}-${key}`} className="text-xs">
                    {key}
                    {schema?.required?.includes(key) && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={`${tool.name}-${key}`}
                    placeholder={prop.description || prop.type || 'string'}
                    value={args[key] || ''}
                    onChange={(e) => setArgs({ ...args, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">此工具不需要参数</p>
          )}

          <Button size="sm" onClick={handleExecute} disabled={isExecuting}>
            <Play className="h-3 w-3 mr-1" />
            执行
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

interface ToolListProps {
  onExecuteTool: (toolName: string, args: Record<string, unknown>) => void;
  executingToolName: string | null;
}

export function ToolList({ onExecuteTool, executingToolName }: ToolListProps) {
  const { tools, connectionStatus } = useMCPStore();

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">连接 Server 后查看可用工具</p>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">此 Server 暂无可用工具</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Tools ({tools.length})</h3>
      </div>
      {tools.map((tool) => (
        <ToolCard
          key={tool.name}
          tool={tool}
          onExecute={onExecuteTool}
          isExecuting={executingToolName === tool.name}
        />
      ))}
    </div>
  );
}
