'use client';

import { useMCPStore } from '../lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ChevronRight } from 'lucide-react';

interface ResourceBrowserProps {
  onReadResource: (uri: string) => void;
}

export function ResourceBrowser({ onReadResource }: ResourceBrowserProps) {
  const { resources, connectionStatus } = useMCPStore();

  if (connectionStatus !== 'connected') {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">连接 Server 后查看资源</p>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">此 Server 暂无可用资源</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Resources ({resources.length})</h3>
      </div>
      {resources.map((resource) => (
        <Card key={resource.uri} className="mb-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  {resource.name || resource.uri.split('/').pop() || resource.uri}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReadResource(resource.uri)}
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                读取
              </Button>
            </div>
            {resource.description && (
              <CardDescription className="mt-1 line-clamp-2 text-xs">
                {resource.description}
              </CardDescription>
            )}
            <p className="text-xs text-muted-foreground mt-1 break-all">{resource.uri}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
