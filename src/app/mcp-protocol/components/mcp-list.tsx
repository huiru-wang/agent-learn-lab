'use client';

import { useMCPStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wrench, Plug, Check } from 'lucide-react';

interface McpListProps {
  // 是否显示选择模式
  selectionMode?: boolean;
  // 已选择的工具列表（格式: "serverId:toolName"）
  selectedTools?: string[];
  // 切换工具选择时的回调
  onToggleTool?: (serverId: string, toolName: string) => void;
}

export function McpList({ selectionMode = false, selectedTools = [], onToggleTool }: McpListProps) {
  const { servers, tools, connectionStatus, currentServerId } = useMCPStore();

  const isConnected = connectionStatus === 'connected';
  const currentServer = servers.find((s) => s.id === currentServerId);

  return (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2 flex-shrink-0">
        可用 MCP
      </h3>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-2 pr-2">
          {!isConnected && (
            <div className="text-center py-6 text-muted-foreground">
              <Plug className="h-6 w-6 mx-auto mb-2 opacity-30" />
              <p className="text-xs">连接 MCP Server 后显示可用工具</p>
            </div>
          )}

          {isConnected && tools.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Wrench className="h-6 w-6 mx-auto mb-2 opacity-30" />
              <p className="text-xs">该 Server 未注册任何工具</p>
            </div>
          )}

          {isConnected && tools.map((tool) => {
            const toolId = `${currentServerId}:${tool.name}`;
            const isSelected = selectedTools.includes(toolId);

            const schema = tool.inputSchema as {
              type?: string;
              properties?: Record<string, {
                type?: string;
                description?: string;
                enum?: string[];
              }>;
              required?: string[];
            } | null;

            const properties = schema?.properties || {};

            return (
              <Card
                key={tool.name}
                className={`border-primary/30 transition-colors ${
                  selectionMode
                    ? isSelected
                      ? 'bg-primary/10 cursor-pointer hover:bg-primary/15'
                      : 'bg-primary/5 cursor-pointer hover:bg-primary/8'
                    : 'bg-primary/5'
                }`}
                onClick={() => {
                  if (selectionMode && onToggleTool && currentServerId) {
                    onToggleTool(currentServerId, tool.name);
                  }
                }}
              >
                <CardHeader className="pb-2 pt-3 px-3">
                  <div className="flex items-center gap-2">
                    {selectionMode && (
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-primary/20' : 'bg-primary/15'
                      }`}>
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Wrench className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>
                    )}
                    {!selectionMode && (
                      <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <CardTitle className="text-xs font-mono text-primary truncate">{tool.name}</CardTitle>
                      {tool.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
                      )}
                    </div>
                    {currentServer?.isBuiltin && !selectionMode && (
                      <span className="text-xs text-muted-foreground ml-auto">内置</span>
                    )}
                  </div>
                </CardHeader>
                {Object.keys(properties).length > 0 && (
                  <CardContent className="px-3 pb-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">参数：</p>
                      {Object.entries(properties).map(([paramName, paramDef]) => (
                        <div key={paramName} className="text-xs bg-muted/50 rounded px-2 py-1">
                          <span className="font-mono text-primary/80">{paramName}</span>
                          {paramDef.type && (
                            <span className="text-muted-foreground ml-1">({paramDef.type})</span>
                          )}
                          {paramDef.enum && (
                            <span className="text-muted-foreground ml-1">
                              — {paramDef.enum.join(' | ')}
                            </span>
                          )}
                          {paramDef.description && (
                            <p className="text-muted-foreground mt-0.5">{paramDef.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
