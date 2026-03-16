import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Construction } from 'lucide-react';

export default function PromptEngineeringPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Prompt 设计</CardTitle>
          <CardDescription>System Prompt、Few-shot、提示词模板</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• System Prompt 的作用与设计原则</li>
            <li>• Few-shot 示例如何引导输出</li>
            <li>• 提示词模板的动态变量注入</li>
            <li>• 不同提示策略的对比效果</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
