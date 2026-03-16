import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Construction } from 'lucide-react';

export default function ReactAgentPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <GitBranch className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>ReAct Agent</CardTitle>
          <CardDescription>Thought-Action-Observation 循环</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• Reasoning + Acting 融合架构</li>
            <li>• Thought 推理过程可视化</li>
            <li>• Action 执行与结果反馈</li>
            <li>• 迭代循环控制策略</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
