'use client';

import { useChatStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function MessageStructure() {
  const { messages, modelParams } = useChatStore();

  const messagesAsJSON = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const systemPrompt = messages.find((m) => m.role === 'system')?.content || '';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">消息结构</CardTitle>
        <p className="text-xs text-muted-foreground">
          Messages 数组的实际格式
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <Tabs defaultValue="messages" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages" className="text-xs">
              Messages
            </TabsTrigger>
            <TabsTrigger value="full" className="text-xs">
              完整请求
            </TabsTrigger>
          </TabsList>
          <TabsContent value="messages" className="flex-1 mt-2">
            <ScrollArea className="h-[calc(100vh-520px)]">
              <pre className="text-xs bg-muted p-3 rounded-lg">
                <code>{JSON.stringify(messagesAsJSON, null, 2)}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="full" className="flex-1 mt-2">
            <ScrollArea className="h-[calc(100vh-520px)]">
              <pre className="text-xs bg-muted p-3 rounded-lg">
                <code>
                  {JSON.stringify(
                    {
                      model: modelParams.model,
                      messages: messagesAsJSON,
                      temperature: modelParams.temperature,
                      max_tokens: modelParams.maxTokens,
                      stream: modelParams.stream,
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
