import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Construction } from 'lucide-react';

export default function MultiAgentPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>多 Agent 架构</CardTitle>
          <CardDescription>层级协作、任务分配、消息传递</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• 主从式 Agent 协作</li>
            <li>• 任务分解与分配策略</li>
            <li>• Agent 间消息传递</li>
            <li>• 结果聚合与冲突解决</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
