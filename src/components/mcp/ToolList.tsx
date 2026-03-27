'use client';

import type { MCPTool } from './types';

interface ToolListProps {
  tools: MCPTool[];
  selectedTools: string[];  // 格式: "serverId:toolName"
  serverId: string;
  onToggle: (serverId: string, toolName: string) => void;
}

export function ToolList({ tools, selectedTools, serverId, onToggle }: ToolListProps) {
  if (tools.length === 0) {
    return (
      <div className="pl-5 py-1 text-xs text-muted-foreground">
        暂无工具
      </div>
    );
  }

  return (
    <div className="pl-5 space-y-1">
      {tools.map((tool) => {
        const toolId = `${serverId}:${tool.name}`;
        const isSelected = selectedTools.includes(toolId);

        return (
          <label
            key={tool.name}
            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(serverId, tool.name)}
              className="rounded border-muted-foreground/30"
            />
            <span className="font-mono text-xs">{tool.name}</span>
            {tool.description && (
              <span className="text-muted-foreground text-xs truncate">
                {tool.description.slice(0, 30)}
                {tool.description.length > 30 ? '...' : ''}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
