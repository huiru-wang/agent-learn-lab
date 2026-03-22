'use client';

import type { IntentDef } from '../lib/intent-registry';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntentDetailDialogProps {
  intent: IntentDef | null;
  onClose: () => void;
}

export function IntentDetailDialog({ intent, onClose }: IntentDetailDialogProps) {
  if (!intent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 bg-background border rounded-lg shadow-lg w-[500px] max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
              {intent.name}
            </code>
            <span className="text-base font-medium">{intent.label}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-muted-foreground">{intent.description}</p>
          <div>
            <h4 className="text-sm font-medium mb-2">槽位</h4>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">名称</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">标签</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">类型</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">必填</th>
                  </tr>
                </thead>
                <tbody>
                  {intent.slots.map((slot, idx) => (
                    <tr
                      key={slot.name}
                      className={cn(
                        idx % 2 === 0 ? '' : 'bg-muted/20'
                      )}
                    >
                      <td className="px-3 py-2">
                        <code className="text-xs font-mono">{slot.name}</code>
                      </td>
                      <td className="px-3 py-2 text-sm">{slot.label}</td>
                      <td className="px-3 py-2 text-sm">{slot.type}</td>
                      <td className="px-3 py-2 text-sm">
                        {slot.required ? (
                          <span className="text-red-500">是</span>
                        ) : (
                          <span className="text-muted-foreground">否</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
