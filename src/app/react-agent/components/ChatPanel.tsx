'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useReactAgentStore } from '../lib/store';
import { useAgentConfigStore } from '@/lib/agent-config-store';
import { sendExecutionMessage } from '../lib/chat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Trash2, Loader2, User, Bot } from 'lucide-react';
import { MarkdownContent } from '@/components/ui/markdown-content';

const DEFAULT_TASK = '杭州明天天气如何？如果天气好的话，帮我详细推荐下离杭州东站比较近的景点，最好提供景点图片，然后再帮我看下最近景点附近的饭店，还有我比较喜欢吃辣。';

export function ChatPanel() {
    const [input, setInput] = useState(DEFAULT_TASK);
    const [selectedModel, setSelectedModel] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const config = useAgentConfigStore((s) => s.config);
    const models = config?.models || [];

    // Update selectedModel when config loads
    useEffect(() => {
        if (models.length > 0 && !selectedModel) {
            setSelectedModel(models[0].id);
        }
    }, [models, selectedModel]);
    const { status, taskInput, trace, currentThought, currentAction, currentObservation, currentContent, setTaskInput, reset } = useReactAgentStore();

    const isRunning = status === 'running';

    // Auto-scroll to bottom
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [status, trace.steps.length, trace.finalAnswer, currentThought, currentAction, currentObservation, currentContent]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isRunning || !selectedModel) return;
        setTaskInput(input.trim());
        setInput('');
        await sendExecutionMessage(input.trim(), selectedModel);
    }, [input, isRunning, selectedModel, setTaskInput]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleReset = () => {
        reset();
        setInput('');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Message list */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-4">
                    {/* 空状态 */}
                    {status === 'idle' && !taskInput && (
                        <div className="text-center text-muted-foreground py-12">
                            <Bot className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">输入任务并发送，开始执行</p>
                        </div>
                    )}

                    {/* 用户消息 - 头像在右边 */}
                    {taskInput && (
                        <div className="flex gap-3 flex-row-reverse">
                            <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 bg-primary text-primary-foreground">
                                <User className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm bg-primary/10 rounded-lg px-3 py-2 inline-block text-left">
                                    {taskInput}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 执行中状态 - 助手在左边 */}
                    {isRunning && (
                        <div className="flex gap-3">
                            <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="flex-1 text-sm text-muted-foreground flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                执行中...
                            </div>
                        </div>
                    )}

                    {/* 最终答案 - 助手在左边 */}
                    {trace.finalAnswer && (
                        <div className="flex gap-3">
                            <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="flex-1 text-sm bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2 overflow-hidden border border-green-200 dark:border-green-800">
                                <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">最终答案</div>
                                <MarkdownContent content={trace.finalAnswer} className="text-sm" />
                            </div>
                        </div>
                    )}

                    {/* 流式内容 - 在 finalAnswer 设置前显示 */}
                    {currentContent && !trace.finalAnswer && (
                        <div className="flex gap-3">
                            <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="flex-1 text-sm">
                                <div className="text-xs text-muted-foreground mb-1">生成答案中...</div>
                                <div className="bg-muted/50 rounded-lg px-3 py-2">
                                    <pre className="text-sm whitespace-pre-wrap break-words font-sans">{currentContent}</pre>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            {/* Input area */}
            <div className="border-t bg-background p-4">
                {/* Model selection */}
                {models.length > 1 && (
                    <div className="mb-2">
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="text-xs border rounded px-2 py-1 bg-background text-muted-foreground"
                            disabled={isRunning}
                        >
                            {models.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.id}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="flex gap-2">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入任务描述..."
                        disabled={isRunning}
                        className="min-h-[44px] max-h-32 resize-none"
                        rows={1}
                    />
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isRunning}
                            size="icon"
                        >
                            {isRunning ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            size="icon"
                            disabled={isRunning}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
