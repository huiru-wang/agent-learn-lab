import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plug, Construction } from 'lucide-react';

export default function MCPProtocolPage() {
  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plug className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>MCP 协议</CardTitle>
          <CardDescription>Local Stdio、Remote SSE、Remote StreamableHTTP</CardDescription>
          <Badge variant="outline" className="mx-auto mt-2">
            <Construction className="h-3 w-3 mr-1" />
            开发中
          </Badge>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>本章节将演示：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• MCP 协议规范与消息格式</li>
            <li>• Local Stdio 传输模式</li>
            <li>• Remote SSE 实时通信</li>
            <li>• Remote StreamableHTTP 流式传输</li>
            <li>• Resource、Tool、Prompt 三大能力</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
