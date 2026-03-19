'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    MessageSquare,
    FileText,
    Wrench,
    Plug,
    Brain,
    GitBranch,
    TreeDeciduous,
    RotateCcw,
    Layers,
    Database,
    Search,
    Users,
    Radio,
    Monitor,
    Home,
    type LucideIcon,
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

interface NavSection {
    category: string;
    items: NavItem[];
}

type Navigation = (NavItem & { href: '/' }) | NavSection;

const navigation: Navigation[] = [
    { name: '首页', href: '/', icon: Home },
    {
        category: '基础篇',
        items: [
            { name: 'Chatbot', href: '/chatbot', icon: MessageSquare },
            { name: 'Prompt设计', href: '/prompt-engineering', icon: FileText },
            { name: 'Tool Call', href: '/tool-call', icon: Wrench },
        ],
    },
    {
        category: '协议篇',
        items: [
            { name: 'MCP协议', href: '/mcp-protocol', icon: Plug },
        ],
    },
    {
        category: '架构篇',
        items: [
            { name: '意图识别', href: '/intent-agent', icon: Brain },
            { name: 'ReAct Agent', href: '/react-agent', icon: GitBranch },
            { name: '思维链/树', href: '/chain-of-thought', icon: TreeDeciduous },
            { name: '反思Agent', href: '/reflection-agent', icon: RotateCcw },
        ],
    },
    {
        category: '系统篇',
        items: [
            { name: 'Context管理', href: '/context-management', icon: Layers },
            { name: 'Memory管理', href: '/memory-management', icon: Database },
            { name: 'RAG Agent', href: '/rag-agent', icon: Search },
        ],
    },
    {
        category: '进阶篇',
        items: [
            { name: '多Agent架构', href: '/multi-agent', icon: Users },
            { name: 'A2A协议', href: '/a2a-protocol', icon: Radio },
            { name: 'A2UI协议', href: '/a2ui-protocol', icon: Monitor },
        ],
    },
];

function isNavItem(item: Navigation): item is NavItem & { href: '/' } {
    return 'name' in item && 'href' in item && 'icon' in item;
}

export function Sidebar() {
    const pathname = usePathname();

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
                {navigation.map((section) => {
                    if (isNavItem(section)) {
                        const Icon = section.icon;
                        return (
                            <Link
                                key={section.href}
                                href={section.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-1',
                                    pathname === section.href
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {section.name}
                            </Link>
                        );
                    }

                    return (
                        <div key={section.category} className="mb-4">
                            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {section.category}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
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
                            </div>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
