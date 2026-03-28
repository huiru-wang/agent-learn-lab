'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2, Loader2 } from 'lucide-react';

interface ChatInputPanelProps {
    input: string;
    onInputChange: (value: string) => void;
    onSend: () => void;
    onClear?: () => void;
    isStreaming?: boolean;
    placeholder?: string;
    disabled?: boolean;
}

export function ChatInputPanel({
    input,
    onInputChange,
    onSend,
    onClear,
    isStreaming = false,
    placeholder = '输入消息...',
    disabled = false,
}: ChatInputPanelProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    const isDisabled = disabled || isStreaming;

    return (
        <div className="border-t bg-background p-4">
            <div className="flex gap-2">
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={isDisabled}
                    className="min-h-[44px] max-h-32 resize-none"
                    rows={1}
                />
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={onSend}
                        disabled={!input.trim() || isDisabled}
                        size="icon"
                    >
                        {isStreaming ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                    {onClear && (
                        <Button
                            onClick={onClear}
                            variant="outline"
                            size="icon"
                            disabled={isDisabled}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{placeholder}</span>
                <span>{input.length} 字符</span>
            </div>
        </div>
    );
}
