import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Construction } from 'lucide-react';

export default function ReflectionAgentPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <RotateCcw className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>反思 Agent</CardTitle>
          <CardDescription>自我审查、迭代改进</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• 输出质量自评估机制</li>
            <li>• 问题发现与改进建议生成</li>
            <li>• 迭代优化对比展示</li>
            <li>• 收敛条件判断</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
