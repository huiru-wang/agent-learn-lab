import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Construction } from 'lucide-react';

export default function MemoryManagementPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Memory 记忆管理</CardTitle>
          <CardDescription>短期记忆、长期记忆、向量存储</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• 短期记忆队列管理</li>
            <li>• 长期记忆持久化存储</li>
            <li>• 向量相似度检索</li>
            <li>• 记忆召回策略</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
