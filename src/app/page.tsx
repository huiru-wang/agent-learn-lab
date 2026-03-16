import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  ArrowRight,
} from 'lucide-react';

const learningPath = [
  {
    category: '基础篇',
    description: '理解 LLM 基本交互原理',
    items: [
      {
        title: 'Chatbot基础',
        href: '/chatbot',
        icon: MessageSquare,
        description: 'Messages 结构、模型参数、Streaming 流式响应',
        status: 'done',
      },
      {
        title: 'Prompt设计',
        href: '/prompt-engineering',
        icon: FileText,
        description: 'System Prompt、Few-shot、提示词模板',
        status: 'todo',
      },
      {
        title: 'Tool Call',
        href: '/tool-call',
        icon: Wrench,
        description: '函数定义、参数解析、调用流程',
        status: 'todo',
      },
    ],
  },
  {
    category: '协议篇',
    description: '掌握 Agent 通信协议',
    items: [
      {
        title: 'MCP协议',
        href: '/mcp-protocol',
        icon: Plug,
        description: 'Local Stdio、Remote SSE、Remote StreamableHTTP',
        status: 'todo',
      },
    ],
  },
  {
    category: '架构篇',
    description: '构建智能 Agent 架构',
    items: [
      {
        title: '意图识别',
        href: '/intent-agent',
        icon: Brain,
        description: '输入分类、置信度评估、决策树可视化',
        status: 'todo',
      },
      {
        title: 'ReAct Agent',
        href: '/react-agent',
        icon: GitBranch,
        description: 'Thought-Action-Observation 循环',
        status: 'todo',
      },
      {
        title: '思维链/树',
        href: '/chain-of-thought',
        icon: TreeDeciduous,
        description: 'Chain of Thought、Tree of Thoughts',
        status: 'todo',
      },
      {
        title: '反思Agent',
        href: '/reflection-agent',
        icon: RotateCcw,
        description: '自我审查、迭代改进',
        status: 'todo',
      },
    ],
  },
  {
    category: '系统篇',
    description: '构建生产级 Agent 系统',
    items: [
      {
        title: 'Context管理',
        href: '/context-management',
        icon: Layers,
        description: 'Token 限制、滑动窗口、上下文压缩',
        status: 'todo',
      },
      {
        title: 'Memory管理',
        href: '/memory-management',
        icon: Database,
        description: '短期记忆、长期记忆、向量存储',
        status: 'todo',
      },
      {
        title: 'RAG Agent',
        href: '/rag-agent',
        icon: Search,
        description: '检索增强生成、文档切块、向量检索',
        status: 'todo',
      },
    ],
  },
  {
    category: '进阶篇',
    description: '探索前沿 Agent 技术',
    items: [
      {
        title: '多Agent架构',
        href: '/multi-agent',
        icon: Users,
        description: '层级协作、任务分配、消息传递',
        status: 'todo',
      },
      {
        title: 'A2A协议',
        href: '/a2a-protocol',
        icon: Radio,
        description: 'Agent-to-Agent 通信协议',
        status: 'todo',
      },
      {
        title: 'A2UI协议',
        href: '/a2ui-protocol',
        icon: Monitor,
        description: 'Agent-to-UI 交互协议',
        status: 'todo',
      },
    ],
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'done':
      return <Badge variant="default">已完成</Badge>;
    case 'progress':
      return <Badge variant="secondary">进行中</Badge>;
    default:
      return <Badge variant="outline">待开发</Badge>;
  }
};

export default function HomePage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Agent Learn Lab</h1>
          <p className="text-xl text-muted-foreground">
            从零开始学习 Agent 开发，通过可视化演示理解每个知识点的内部执行逻辑
          </p>
        </div>

        <div className="space-y-12">
          {learningPath.map((section) => (
            <section key={section.category}>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                  {section.category}
                </h2>
                <p className="text-muted-foreground mt-1">{section.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <item.icon className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          {item.description}
                        </CardDescription>
                        <div className="mt-4 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          开始学习 <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 p-6 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2">技术栈</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Next.js 15</Badge>
            <Badge variant="outline">TypeScript</Badge>
            <Badge variant="outline">Tailwind CSS</Badge>
            <Badge variant="outline">shadcn/ui</Badge>
            <Badge variant="outline">Vercel AI SDK</Badge>
            <Badge variant="outline">Zustand</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
