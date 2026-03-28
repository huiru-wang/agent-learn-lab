'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useToolCallStore } from '../lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Trash2, Loader2, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownContent } from '@/components/ui/markdown-content';

interface AvailableModel {
    id: string;
    name: string;
    provider: string;
    model: string;
}

type AccumulatedToolCall = {
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
};

interface SSEEvent {
    type: 'llm_request' | 'llm_response' | 'tool_call' | 'tool_result' | 'chunk' | 'error';
    round?: number;
    request?: unknown;
    response?: {
        finish_reason: string;
        tool_calls?: AccumulatedToolCall[];
        usage?: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
    toolName?: string;
    args?: Record<string, unknown>;
    result?: unknown;
    delta?: string;
    error?: string;
}

export function ChatArea() {
    const [input, setInput] = useState('');
    const [models, setModels] = useState<AvailableModel[]>([]);
    const [selectedModel, setSelectedModel] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isStreaming,
        addMessage,
        updateLastAssistantMessage,
        addTraceStep,
        updateTraceStep,
        setIsStreaming,
        setCurrentToolCall,
        setToolResult,
        clearAll,
    } = useToolCallStore();

    // 加载可用模型
    useEffect(() => {
        fetch('/api/models')
            .then((r) => r.json())
            .then((data) => {
                const list: AvailableModel[] = data.models || [];
                setModels(list);
                if (list.length > 0) setSelectedModel(list[0].id);
            })
            .catch(() => { });
    }, []);

    // 自动滚动到底部
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming]);

    // 自动调整 textarea 高度
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isStreaming || !selectedModel) return;

        const userContent = input.trim();
        setInput('');

        // 清空轨迹（保留消息历史）
        useToolCallStore.setState({ trace: [], currentToolCall: null, toolExecutionResult: null });

        // 添加用户消息
        addMessage({ role: 'user', content: userContent });

        // 准备发送的 messages
        const currentMessages = useToolCallStore.getState().messages;
        const apiMessages = currentMessages.map((m) => ({ role: m.role, content: m.content }));

        setIsStreaming(true);

        // 添加用户输入步骤（固定，无详情按钮）
        addTraceStep({
            label: 'User Input',
            status: 'completed',
            content: userContent,
        });

        // 添加空的 assistant 消息占位
        addMessage({ role: 'assistant', content: '' });

        // 动态追踪：每轮的 request stepId
        // roundMap[round] = { requestStepId }
        const roundMap: Record<number, { requestStepId: string }> = {};
        // 当前流式内容（用于更新 LLM Response 步骤）
        let fullContent = '';

        try {
            const response = await fetch('/tool-call/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages, model: selectedModel }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data: ')) continue;

                    let event: SSEEvent;
                    try {
                        event = JSON.parse(trimmed.slice(6));
                    } catch {
                        continue;
                    }

                    if (event.type === 'llm_request') {
                        // 动态创建 LLM Request 步骤
                        const round = event.round ?? 1;
                        const id = addTraceStep({
                            label: `Round ${round} · LLM Request`,
                            status: 'active',
                            content: '...',
                            detail: { request: event.request, stepType: 'llm_request' },
                        });
                        roundMap[round] = { requestStepId: id };
                        fullContent = '';
                    } else if (event.type === 'chunk' && event.delta) {
                        fullContent += event.delta;
                        updateLastAssistantMessage(fullContent);
                        // 找到当前 pending 的 request step，更新 content
                        const latestRound = Math.max(...Object.keys(roundMap).map(Number));
                        const entry = roundMap[latestRound];
                        if (entry) {
                            updateTraceStep(entry.requestStepId, {
                                content: fullContent || '...',
                            });
                        }
                    } else if (event.type === 'llm_response') {
                        const round = event.round ?? 1;
                        const entry = roundMap[round];
                        if (entry) {
                            updateTraceStep(entry.requestStepId, {
                                status: 'completed',
                                content: fullContent || event.response?.finish_reason || 'done',
                                detail: {
                                    request: useToolCallStore.getState().trace.find(s => s.id === entry.requestStepId)?.detail?.request,
                                    response: event.response,
                                    stepType: 'llm_response',
                                    toolCalls: event.response?.tool_calls,
                                },
                            });
                        }
                    } else if (event.type === 'tool_call') {
                        // 动态创建 Tool Call 步骤
                        const argsStr = JSON.stringify(event.args || {}, null, 2);
                        setCurrentToolCall({ name: event.toolName || '', args: event.args || {} });
                        addTraceStep({
                            label: `Tool Call: ${event.toolName}`,
                            status: 'completed',
                            content: argsStr,
                            detail: { stepType: 'tool_call' },
                        });
                    } else if (event.type === 'tool_result') {
                        const resultStr = String(event.result || '');
                        setToolResult(event.result);
                        // 找到最近的一个 Tool Call 步骤，用其 toolName
                        const trace = useToolCallStore.getState().trace;
                        const lastToolCallIdx = trace.findLastIndex(s => s.detail?.stepType === 'tool_call');
                        const toolName = lastToolCallIdx >= 0 ? trace[lastToolCallIdx].label.replace('Tool Call: ', '') : event.toolName || '';
                        addTraceStep({
                            label: `Tool Call Result: ${toolName}`,
                            status: 'completed',
                            content: resultStr,
                            detail: { stepType: 'tool_call_result' },
                        });
                    } else if (event.type === 'error') {
                        throw new Error(event.error || 'Stream error');
                    }
                }
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            updateLastAssistantMessage(`Error: ${errorMsg}`);
            addTraceStep({ label: 'Error', status: 'error', content: errorMsg });
        } finally {
            setIsStreaming(false);
        }
    }, [
        input,
        isStreaming,
        selectedModel,
        addMessage,
        addTraceStep,
        updateTraceStep,
        setIsStreaming,
        setCurrentToolCall,
        setToolResult,
        updateLastAssistantMessage,
    ]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* 消息列表 */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {messages.length === 0 && !isStreaming && (
                        <div className="text-center text-muted-foreground py-12">
                            <Bot className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">试试问：「纽约现在几点？」</p>
                        </div>
                    )}
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                'flex gap-3',
                                message.role === 'user' ? 'flex-row-reverse' : ''
                            )}
                        >
                            <div
                                className={cn(
                                    'h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0',
                                    message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                )}
                            >
                                {message.role === 'user' ? (
                                    <User className="h-4 w-4" />
                                ) : (
                                    <Bot className="h-4 w-4" />
                                )}
                            </div>
                            <div
                                className={cn(
                                    'max-w-[75%] text-sm',
                                    message.role === 'user'
                                        ? 'bg-primary/10 rounded-lg px-3 py-2 text-right'
                                        : 'py-1'
                                )}
                            >
                                {message.content ? (
                                    <MarkdownContent content={message.content} />
                                ) : (
                                    isStreaming && message.role === 'assistant' ? (
                                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            生成中...
                                        </span>
                                    ) : null
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            {/* 输入区域 */}
            <div className="border-t bg-background p-4">
                {/* 模型选择 */}
                {models.length > 1 && (
                    <div className="mb-2">
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="text-xs border rounded px-2 py-1 bg-background text-muted-foreground"
                            disabled={isStreaming}
                        >
                            {models.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
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
                        placeholder="纽约现在几点？"
                        disabled={isStreaming}
                        className="min-h-[44px] max-h-32 resize-none"
                        rows={1}
                    />
                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isStreaming || !selectedModel}
                            size="icon"
                        >
                            {isStreaming ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            onClick={clearAll}
                            variant="outline"
                            size="icon"
                            disabled={isStreaming}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
