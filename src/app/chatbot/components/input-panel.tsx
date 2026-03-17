'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { sendMessage } from '../lib/chat';

export function InputPanel() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isStreaming, clearMessages, messages, modelParams } = useChatStore();

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');

    await sendMessage(userMessage, messages, modelParams);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Shift+Enter 换行, Enter 发送)"
          disabled={isStreaming}
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            size="icon"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={clearMessages}
            variant="outline"
            size="icon"
            disabled={isStreaming}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          提示: 消息会按 Messages 数组格式发送给 LLM API
        </span>
        <span>{input.length} 字符</span>
      </div>
    </div>
  );
}
