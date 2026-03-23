'use client';

import { useReactAgentStore } from '../lib/store';
import { TOOLS, TOOL_COLORS, type ToolName } from '../lib/tools';
import { cn } from '@/lib/utils';

export function ToolSelector() {
  const { enabledTools, toggleTool, status } = useReactAgentStore();
  const isDisabled = status === 'running' || status === 'replaying';

  return (
    <div className="space-y-2">
      {TOOLS.map((tool) => {
        const isEnabled = enabledTools.includes(tool.name);
        return (
          <label
            key={tool.name}
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted',
              isEnabled && 'bg-muted/50'
            )}
          >
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={() => !isDisabled && toggleTool(tool.name)}
              disabled={isDisabled}
              className={cn(
                'w-4 h-4 rounded border-2 transition-colors',
                tool.name === 'weather_api' && 'border-blue-500 text-blue-500',
                tool.name === 'calculator' && 'border-green-500 text-green-500',
                tool.name === 'search' && 'border-orange-500 text-orange-500',
                'checked:bg-current'
              )}
            />
            <span
              className={cn(
                'w-3 h-3 rounded-full',
                TOOL_COLORS[tool.name]
              )}
              style={{
                backgroundColor:
                  tool.name === 'weather_api'
                    ? '#3b82f6'
                    : tool.name === 'calculator'
                      ? '#22c55e'
                      : '#f97316',
              }}
            />
            <div className="flex-1">
              <span className="font-mono text-sm">{tool.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {tool.description}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}
