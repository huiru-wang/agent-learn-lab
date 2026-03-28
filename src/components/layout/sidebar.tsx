'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAgentConfigStore } from '@/lib/agent-config-store';
import {
    MessageSquare,
    FileText,
    Wrench,
    Plug,
    Brain,
    GitBranch,
    RotateCcw,
    Layers,
    Database,
    Search,
    Users,
    Radio,
    Monitor,
    type LucideIcon,
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

const navigation: NavItem[] = [
    { name: 'Chatbot', href: '/chatbot', icon: MessageSquare },
    { name: 'Prompt设计', href: '/prompt-engineering', icon: FileText },
    { name: 'Tool Call', href: '/tool-call', icon: Wrench },
    { name: 'MCP协议', href: '/mcp-protocol', icon: Plug },
    { name: '意图识别', href: '/intent-agent', icon: Brain },
    { name: 'ReAct Agent', href: '/react-agent', icon: GitBranch },
    { name: 'Context管理', href: '/context-management', icon: Layers },
    { name: 'Memory管理', href: '/memory-management', icon: Database },
    { name: 'RAG Agent', href: '/rag-agent', icon: Search },
    { name: '多Agent架构', href: '/multi-agent', icon: Users },
    { name: 'A2A协议', href: '/a2a-protocol', icon: Radio },
    { name: 'A2UI协议', href: '/a2ui-protocol', icon: Monitor },
];

export function Sidebar() {
    const pathname = usePathname();
    const fetchConfig = useAgentConfigStore((s) => s.fetchConfig);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background">
            <div className="flex h-12 items-center px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold text-base">
                    <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                        <Brain className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span>Agent Learn Lab</span>
                </Link>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors mb-1',
                                pathname === item.href
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
