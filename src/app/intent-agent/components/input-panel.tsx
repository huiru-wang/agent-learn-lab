'use client';

import { useState, useRef, useEffect } from 'react';
import { useIntentAgentStore } from '../lib/store';
import { sendIntentMessage } from '../lib/chat';
import { quickExamples } from '../lib/intent-registry';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2, Loader2, Sparkles } from 'lucide-react';

interface AvailableModel {
    id: string;
    name: string;
    provider: string;
    model: string;
}

export function InputPanel() {
    const [input, setInput] = useState('');
    const [models, setModels] = useState<AvailableModel[]>([]);
    const [selectedModel, setSelectedModel] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { isStreaming, clearAll } = useIntentAgentStore();

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

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || isStreaming || !selectedModel) return;
        const text = input.trim();
        setInput('');
        await sendIntentMessage(text, selectedModel);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t bg-background p-3">
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
                    placeholder="输入自然语言查询... (Enter 分析)"
                    disabled={isStreaming}
                    className="min-h-[40px] max-h-24 resize-none text-sm"
                    rows={1}
                />
                <div className="flex flex-col gap-1.5">
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming || !selectedModel}
                        size="icon"
                        className="h-8 w-8"
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
                        className="h-8 w-8"
                        disabled={isStreaming}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
                {quickExamples.map((example) => (
                    <button
                        key={example.text}
                        onClick={() => setInput(example.text)}
                        className="text-xs px-2.5 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors inline-flex items-center gap-1"
                    >
                        <Sparkles className="h-3 w-3" />
                        {example.hint}
                    </button>
                ))}
            </div>
        </div>
    );
}
