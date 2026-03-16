import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Construction } from 'lucide-react';

export default function RAGAgentPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>RAG Agent</CardTitle>
          <CardDescription>检索增强生成、文档切块、向量检索</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• 文档切块策略 (Chunking)</li>
            <li>• 向量化嵌入过程</li>
            <li>• 相似度检索与重排序</li>
            <li>• Context 注入与生成</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
