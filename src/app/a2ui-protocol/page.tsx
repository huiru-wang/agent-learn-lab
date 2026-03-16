import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Construction } from 'lucide-react';

export default function A2UIProtocolPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Monitor className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>A2UI 协议</CardTitle>
          <CardDescription>Agent-to-UI 交互协议</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• Agent 意图到 UI 组件映射</li>
            <li>• 动态表单生成</li>
            <li>• 交互事件流处理</li>
            <li>• 状态同步机制</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
