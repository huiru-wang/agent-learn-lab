import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Construction } from 'lucide-react';

export default function A2AProtocolPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Radio className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>A2A 协议</CardTitle>
          <CardDescription>Agent-to-Agent 通信协议</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• Agent Card 能力描述</li>
            <li>• Agent 发现与握手</li>
            <li>• 任务委托与状态跟踪</li>
            <li>• 跨 Agent 协作流程</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
