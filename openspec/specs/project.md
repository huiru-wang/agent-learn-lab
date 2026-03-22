# Project Context

## 项目愿景与定位

Agent Learn Lab 致力于成为 **最实用的 Agent 开发学习平台**，通过「理论+实践」的双轨模式，帮助开发者从零开始学习 Agent 开发的核心概念和技术。

## 核心理念

1. **Learn by Doing**: 用户不仅阅读文档，还能在页面内直接与 Agent 交互，实时观察输入/输出、中间步骤、工具调用等行为。

2. **概念原子化**: 每个模块聚焦一个核心概念（如 ReAct、RAG、MCP），避免信息过载。

3. **透明性优先**: 所有内部状态（prompt 构造、上下文截断逻辑、工具调用参数）应可展开查看，帮助用户理解「黑盒」背后机制。

4. **渐进式复杂度**: 从基础 Chatbot → 单 Agent 高级模式 → 多 Agent 协作，形成学习路径。

## 技术栈

- **框架**: Next.js 16 + React 19
- **样式**: Tailwind CSS v4 + shadcn/ui
- **语言**: TypeScript
- **包管理**: pnpm

### 关键依赖

- `react-markdown` + `remark-gfm` - Markdown 渲染
- `react-syntax-highlighter` - 代码语法高亮
- `next/font/google` - 字体加载（Geist、Inter、Noto Sans SC）

## 模块总览

| 模块 | 路径 | 描述 | 状态 |
|---|---|---|---|
| Chatbot | `/chatbot` | 对话机器人基础：消息流、参数控制、滑动窗口上下文 | 已实现 |
| Prompt Engineering | `/prompt-engineering` | Prompt 设计技巧：System Prompt、Few-shot、CoT 等 | 已实现 |
| Tool Call | `/tool-call` | Function Calling 机制、工具定义与注册 | 规划中 |
| MCP Protocol | `/mcp-protocol` | Model Context Protocol 架构与 MCP Server | 规划中 |
| Intent Agent | `/intent-agent` | 意图识别、槽位填充、多意图处理 | 规划中 |
| ReAct Agent | `/react-agent` | Reason + Act 模式、Agent 决策循环 | 规划中 |
| Chain of Thought | `/chain-of-thought` | 思维链、思维树、自我一致性 | 规划中 |
| Reflection Agent | `/reflection-agent` | 反思机制、迭代改进、自我评估 | 规划中 |
| Context Management | `/context-management` | 上下文管理：滑动窗口、摘要压缩、Token 预算 | 规划中 |
| Memory Management | `/memory-management` | 记忆系统：工作记忆、情节记忆、语义记忆 | 规划中 |
| RAG Agent | `/rag-agent` | 检索增强生成：文档处理、向量化、检索优化 | 规划中 |
| Multi-Agent | `/multi-agent` | 多 Agent 协作：任务分解、Agent 通信、协调机制 | 规划中 |
| A2A Protocol | `/a2a-protocol` | Agent-to-Agent 通信协议 | 规划中 |
| A2UI Protocol | `/a2ui-protocol` | Agent-to-UI 交互协议、动态 UI 生成 | 规划中 |

## 共享数据模型

### 消息结构

```typescript
interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentPart[];
  createdAt: Date;
  metadata?: MessageMetadata;
}

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'tool_call'; toolCallId: string; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; toolCallId: string; result: unknown };

interface MessageMetadata {
  model?: string;
  tokens?: { input: number; output: number };
  latency?: number;
  finishReason?: string;
}
```

### 工具定义

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

interface ToolCall {
  id: string;
  name: string;
  arguments: string;
  result?: unknown;
  status: 'pending' | 'running' | 'completed' | 'error';
}
```

### Agent 状态

```typescript
interface AgentState {
  status: 'idle' | 'thinking' | 'acting' | 'observing' | 'completed' | 'error';
  currentStep: number;
  totalSteps?: number;
  thought?: string;
  action?: ToolCall;
  observation?: unknown;
  history: AgentStep[];
}

interface AgentStep {
  step: number;
  thought?: string;
  action?: { tool: string; args: Record<string, unknown> };
  observation?: unknown;
  timestamp: Date;
}
```

### 模块配置

```typescript
interface ModuleConfig {
  id: string;
  name: string;
  path: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  estimatedTime: number;
  learningObjectives: string[];
}
```

## 设计原则

- 每个模块包含「演示」和「文档」两个视图
- 支持滑动窗口上下文管理，自动压缩历史消息
- Markdown 文档支持代码高亮和目录导航
- 中英文字体栈：Geist → Inter → Noto Sans SC → system-ui

## 开发路线图

### Phase 1: 基础设施 (Week 1-2)
- [x] 项目初始化配置
- [x] 布局组件开发
- [x] 基础 UI 组件库
- [x] 路由和导航系统

### Phase 2: 核心模块 (Week 3-4)
- [x] Chatbot 模块
- [x] Prompt Engineering 模块
- [ ] Tool Call 模块

### Phase 3: Agent 模块 (Week 5-6)
- [ ] Intent Agent 模块
- [ ] ReAct Agent 模块
- [ ] Chain of Thought 模块
- [ ] Reflection Agent 模块

### Phase 4: 高级模块 (Week 7-8)
- [ ] Context Management 模块
- [ ] Memory Management 模块
- [ ] RAG Agent 模块

### Phase 5: 协议模块 (Week 9-10)
- [ ] MCP Protocol 模块
- [ ] Multi-Agent 模块
- [ ] A2A Protocol 模块
- [ ] A2UI Protocol 模块

### Phase 6: 优化完善 (Week 11-12)
- [ ] 性能优化
- [ ] 文档完善
- [ ] 测试覆盖
- [ ] 部署上线
