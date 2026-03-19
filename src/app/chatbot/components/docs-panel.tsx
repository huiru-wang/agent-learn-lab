'use client';

import { useState, useEffect, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface DocsPanelProps {
  modulePath: string;
  className?: string;
}

interface CodeProps {
  className?: string;
  children?: ReactNode;
}

interface HeadingProps {
  children?: ReactNode;
}

export function DocsPanel({ modulePath, className }: DocsPanelProps) {
  const [content, setContent] = useState('');
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDoc() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${modulePath}/api/docs`);
        if (!response.ok) {
          throw new Error('文档加载失败');
        }
        const text = await response.text();
        setContent(text);
        
        // 提取标题
        const headingRegex = /^(#{1,3})\s+(.+)$/gm;
        const extracted: Heading[] = [];
        let match;
        while ((match = headingRegex.exec(text)) !== null) {
          extracted.push({
            id: match[2].toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-'),
            text: match[2],
            level: match[1].length,
          });
        }
        setHeadings(extracted);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [modulePath]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-muted-foreground">暂无文档</div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full overflow-hidden', className)}>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }: CodeProps) {
                const match = /language-(\w+)/.exec(className || '');
                const inline = !match;
                return !inline ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match?.[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              h1: ({ children }: HeadingProps) => {
                const id = String(children).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
                return <h1 id={id} className="text-2xl font-bold mt-8 mb-4">{children}</h1>;
              },
              h2: ({ children }: HeadingProps) => {
                const id = String(children).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
                return <h2 id={id} className="text-xl font-semibold mt-6 mb-3">{children}</h2>;
              },
              h3: ({ children }: HeadingProps) => {
                const id = String(children).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
                return <h3 id={id} className="text-lg font-medium mt-4 mb-2">{children}</h3>;
              },
              table: ({ children }: HeadingProps) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full divide-y divide-border">{children}</table>
                </div>
              ),
              thead: ({ children }: HeadingProps) => (
                <thead className="bg-muted/50">{children}</thead>
              ),
              tbody: ({ children }: HeadingProps) => (
                <tbody className="divide-y divide-border">{children}</tbody>
              ),
              tr: ({ children }: HeadingProps) => (
                <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
              ),
              th: ({ children }: HeadingProps) => (
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{children}</th>
              ),
              td: ({ children }: HeadingProps) => (
                <td className="px-4 py-2 text-sm">{children}</td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      <div className="w-56 border-l bg-muted/5 shrink-0">
        <div className="p-4">
          <h4 className="text-sm font-medium mb-3">目录</h4>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="space-y-1">
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  onClick={() => scrollToHeading(heading.id)}
                  className={cn(
                    'block w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors',
                    heading.level === 2 && 'pl-2',
                    heading.level === 3 && 'pl-4'
                  )}
                >
                  {heading.text}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
