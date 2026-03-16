import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Construction } from 'lucide-react';

export default function ToolCallPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Wrench className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Tool Call</CardTitle>
          <CardDescription>函数定义、参数解析、调用流程</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• Function Calling 的 JSON Schema 定义</li>
            <li>• 参数解析与验证流程</li>
            <li>• Tool 调用的完整生命周期</li>
            <li>• 多 Tool 协作与结果聚合</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
