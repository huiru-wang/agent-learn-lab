import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Construction } from 'lucide-react';

export default function IntentAgentPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>意图识别 Agent</CardTitle>
          <CardDescription>输入分类、置信度评估、决策树可视化</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• 用户输入的特征提取</li>
            <li>• 多分类决策过程可视化</li>
            <li>• 置信度评分机制</li>
            <li>• 意图到 Action 的映射</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
