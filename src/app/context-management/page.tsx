import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Construction } from 'lucide-react';

export default function ContextManagementPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Context 上下文管理</CardTitle>
          <CardDescription>Token 限制、滑动窗口、上下文压缩</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• Token 计数与限制监控</li>
            <li>• 滑动窗口策略</li>
            <li>• 上下文压缩技术</li>
            <li>• 消息优先级管理</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
