import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreeDeciduous, Construction } from 'lucide-react';

export default function ChainOfThoughtPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <TreeDeciduous className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>思维链/思维树</CardTitle>
          <CardDescription>Chain of Thought、Tree of Thoughts</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• CoT 思维链步进式推理</li>
            <li>• ToT 思维树分支探索</li>
            <li>• 推理路径可视化</li>
            <li>• 剪枝与最优路径选择</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
