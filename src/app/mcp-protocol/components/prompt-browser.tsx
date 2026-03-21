'use client';

import { useState } from 'react';
import { useMCPStore } from '../lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';

interface PromptBrowserProps {
  onGetPrompt: (name: string, args: Record<string, unknown>) => void;
}

function PromptCard({ prompt, onGet }: { prompt: { name: string; description?: string; arguments?: Array<{ name: string; description?: string; required?: boolean }> }; onGet: (args: Record<string, unknown>) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [args, setArgs] = useState<Record<string, string>>({});

  const argDefs = prompt.arguments || [];

  const handleGet = () => {
    const parsedArgs: Record<string, unknown> = {};
    Object.entries(args).forEach(([key, value]) => {
      if (value.trim()) {
        try {
          parsedArgs[key] = JSON.parse(value);
        } catch {
          parsedArgs[key] = value;
        }
      }
    });
    onGet(parsedArgs);
  };

  return (
    <Card className="mb-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => setIsExpanded(!isExpanded)}>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{prompt.name}</CardTitle>
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
        {prompt.description && (
          <CardDescription className="mt-1 line-clamp-2">{prompt.description}</CardDescription>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {argDefs.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">变量</Label>
              {argDefs.map((arg) => (
                <div key={arg.name} className="space-y-1">
                  <Label htmlFor={`prompt-${prompt.name}-${arg.name}`} className="text-xs">
                    {arg.name}
                    {arg.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={`prompt-${prompt.name}-${arg.name}`}
                    placeholder={arg.description || 'string'}
                    value={args[arg.name] || ''}
                    onChange={(e) => setArgs({ ...args, [arg.name]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">此 Prompt 不需要变量</p>
          )}

          <Button size="sm" onClick={handleGet}>
            <MessageSquare className="h-3 w-3 mr-1" />
            获取 Prompt
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export function PromptBrowser({ onGetPrompt }: PromptBrowserProps) {
  const { prompts, connectionStatus } = useMCPStore();

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">连接 Server 后查看提示词</p>
      </div>
    );
  }

  if (!prompts || prompts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">此 Server 暂无可用提示词</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Prompts ({prompts.length})</h3>
      </div>
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.name}
          prompt={prompt}
          onGet={(args) => onGetPrompt(prompt.name, args)}
        />
      ))}
    </div>
  );
}
