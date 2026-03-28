'use client';

import { useState, useEffect, useRef } from 'react';
import { useReactAgentStore } from '../lib/store';
import { useAgentConfigStore } from '@/lib/agent-config-store';
import { sendExecutionMessage } from '../lib/chat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, Pause, RotateCcw, Loader2 } from 'lucide-react';

// 示例任务
const EXAMPLE_TASK = '北京明天天气怎么样？天气好的话推荐下附近的景点。';

export function InputPanel() {
    const [input, setInput] = useState(EXAMPLE_TASK);
    const [selectedModel, setSelectedModel] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const config = useAgentConfigStore((s) => s.config);
    const models = config?.models || [];
    const { status, taskInput, enabledTools, setTaskInput, reset, clearTrace } = useReactAgentStore();

    // Update selectedModel when config loads
    useEffect(() => {
        if (models.length > 0 && !selectedModel) {
            setSelectedModel(models[0].id);
        }
    }, [models, selectedModel]);

    const isRunning = status === 'running';
    const canExecute = input.trim() && !isRunning;

    useEffect(() => {
        setTaskInput(input);
    }, [input, setTaskInput]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleExecute = async () => {
        if (!canExecute) return;
        setInput('');
        await sendExecutionMessage(input.trim(), selectedModel);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleExecute();
        }
    };

    const handleReset = () => {
        reset();
        setInput('');
    };

    const handleClear = () => {
        clearTrace();
    };

    return (
        <div className="h-full flex flex-col p-4 gap-4">
            {/* 任务输入 */}
            <div className="flex-shrink-0">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span>📝</span> 任务输入
                </h3>
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入任务描述..."
                    disabled={isRunning}
                    className="min-h-[100px] resize-none text-sm"
                />
            </div>

            {/* 模型选择 */}
            {models.length > 1 && (
                <div className="flex-shrink-0">
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="text-sm border rounded px-2 py-1.5 bg-background w-full"
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

            {/* 操作按钮 */}
            <div className="flex gap-2 flex-shrink-0">
                <Button
                    onClick={handleExecute}
                    disabled={!canExecute}
                    className="flex-1"
                    size="lg"
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            执行中...
                        </>
                    ) : (
                        <>
                            <Play className="h-4 w-4 mr-2" />
                            执行
                        </>
                    )}
                </Button>
                <Button
                    onClick={handleReset}
                    disabled={isRunning}
                    variant="outline"
                    size="lg"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
