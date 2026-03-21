'use client';

import dynamic from 'next/dynamic';

// Dynamically import the entire page content to avoid SSR issues
const MCPProtocolContent = dynamic(
  () => import('./MCPProtocolContent').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    ),
  }
);

export default function MCPProtocolPage() {
  return <MCPProtocolContent />;
}
