'use client';

import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { allToolDefinitions } from '../lib/tool-registry';

export function ToolList() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
        可用工具
      </h3>
      {allToolDefinitions.map((tool) => (
        <Card key={tool.name} className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-mono text-primary">{tool.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">参数：</p>
              {Object.entries(tool.parameters.properties).map(([paramName, paramDef]) => (
                <div key={paramName} className="text-xs bg-muted/50 rounded px-2.5 py-1.5">
                  <span className="font-mono text-primary/80">{paramName}</span>
                  <span className="text-muted-foreground ml-1">({paramDef.type})</span>
                  {paramDef.enum && (
                    <span className="text-muted-foreground ml-1">
                      — {paramDef.enum.join(' | ')}
                    </span>
                  )}
                  <p className="text-muted-foreground mt-0.5">{paramDef.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
