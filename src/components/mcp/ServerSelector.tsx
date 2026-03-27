'use client';

import { useState, type ReactNode } from 'react';
import { useMCP } from './useMCP';
import { ToolList } from './ToolList';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Loader2, Unplug, Plug } from 'lucide-react';

interface ServerSelectorProps {
  // 可选：自定义 className
  className?: string;
}

export function ServerSelector({ className }: ServerSelectorProps) {
  const {
    servers,
    selectedTools,
    isLoading,
    connectServer,
    disconnectServer,
    toggleTool,
    selectAllTools,
    deselectAllTools,
  } = useMCP();

  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());

  // 切换服务器展开状态
  const toggleExpanded = (serverId: string) => {
    setExpandedServers((prev) => {
      const next = new Set(prev);
      if (next.has(serverId)) {
        next.delete(serverId);
      } else {
        next.add(serverId);
      }
      return next;
    });
  };

  // 全选/取消全选
  const handleSelectAll = (serverId: string) => {
    const server = servers.find((s) => s.server.id === serverId);
    if (!server) return;

    const allSelected = server.tools.every((t) =>
      selectedTools.includes(`${serverId}:${t.name}`)
    );

    if (allSelected) {
      deselectAllTools(serverId);
    } else {
      // 先连接（如果未连接）
      if (!server.isConnected && server.tools.length === 0) {
        connectServer(serverId);
      }
      selectAllTools(serverId);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        加载中...
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        暂无可用服务器
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {servers.map((serverWithTools) => {
        const { server, tools, isConnected, isLoading: serverLoading, error } = serverWithTools;
        const isExpanded = expandedServers.has(server.id);
        const allSelected = tools.length > 0 && tools.every((t) =>
          selectedTools.includes(`${server.id}:${t.name}`)
        );

        return (
          <div key={server.id} className="space-y-1">
            {/* 服务器行 */}
            <div className="flex items-center gap-2">
              {/* 展开/折叠按钮 */}
              <button
                onClick={() => toggleExpanded(server.id)}
                className="p-0.5 hover:bg-muted rounded"
                disabled={!isConnected && tools.length === 0}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>

              {/* 全选 checkbox */}
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => handleSelectAll(server.id)}
                className="rounded border-primary text-primary"
              />

              {/* 服务器名称 */}
              <span className="text-sm font-medium flex items-center gap-1">
                {server.name}
                {server.isBuiltin && (
                  <Badge variant="secondary" className="ml-1 text-xs py-0">内置</Badge>
                )}
              </span>

              {/* 连接状态 */}
              {serverLoading ? (
                <Loader2 className="h-3 w-3 animate-spin ml-auto" />
              ) : isConnected ? (
                <button
                  onClick={() => disconnectServer(server.id)}
                  className="ml-auto p-1 hover:bg-muted rounded"
                  title="断开连接"
                >
                  <Unplug className="h-3 w-3 text-muted-foreground" />
                </button>
              ) : error ? (
                <button
                  onClick={() => connectServer(server.id)}
                  className="ml-auto p-1 hover:bg-muted rounded"
                  title={`重试: ${error}`}
                >
                  <span className="text-xs text-destructive">{error}</span>
                </button>
              ) : (
                <button
                  onClick={() => connectServer(server.id)}
                  className="ml-auto p-1 hover:bg-muted rounded"
                  title="连接"
                >
                  <Plug className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* 工具列表（可折叠） */}
            {isExpanded && (
              <ToolList
                tools={tools}
                selectedTools={selectedTools}
                serverId={server.id}
                onToggle={toggleTool}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
