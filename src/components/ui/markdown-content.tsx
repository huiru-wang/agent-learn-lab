'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export function MarkdownContent({
  content,
  className
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn('break-words', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="break-words mb-2 last:mb-0" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              {children}
            </p>
          ),
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              return (
                <code className={cn('px-1 py-0.5 rounded bg-muted text-xs font-mono', className)}>
                  {children}
                </code>
              );
            }

            return (
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words p-2 bg-muted rounded my-2">
                <code>{children}</code>
              </pre>
            );
          },
          a: ({ href, children }) => (
            <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
          li: ({ children }) => <li className="break-words">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground/25 pl-4 italic text-muted-foreground mb-2">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}