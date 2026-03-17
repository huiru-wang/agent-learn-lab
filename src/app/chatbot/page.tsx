'use client';

import { MessageTimeline } from './components/message-timeline';
import { ParamControls } from './components/param-controls';
import { TokenCounter } from './components/token-counter';
import { InputPanel } from './components/input-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChatbotPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 border-r">
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold">01</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold">Chatbot</h1>
              <p className="text-sm text-muted-foreground truncate">
                Messages 结构、模型参数、Streaming 流式响应
              </p>
            </div>
          </div>
        </div>

        <MessageTimeline />
        <InputPanel />
      </div>

      <div className="w-80 border-l bg-muted/5 overflow-y-auto flex-shrink-0">
        <div className="p-4 space-y-4">
          <ParamControls />
          <TokenCounter />

          <Card>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Messages 结构</h4>
                <p className="text-xs">
                  Messages 是与 LLM 交互的核心数据结构，每条消息包含 role（system/user/assistant）和 content。
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">模型参数</h4>
                <p className="text-xs">
                  Temperature 控制随机性，Max Tokens 限制输出长度，Top P 进行核采样。
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Streaming</h4>
                <p className="text-xs">
                  流式响应让用户实时看到生成过程，提升用户体验，降低首字延迟感知。
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">请求/响应日志</h4>
                <p className="text-xs">
                  点击消息下方的 request/response 按钮可查看原始 HTTP 交互细节。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
