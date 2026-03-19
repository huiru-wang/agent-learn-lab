# Project Context

## 项目背景

Agent Learn Lab 是一个面向开发者的 Agent 开发学习平台，通过交互式演示和文档帮助开发者从零开始学习 Agent 开发的核心概念和技术。

## 技术栈

- **框架**: Next.js 16 + React 19
- **样式**: Tailwind CSS v4 + shadcn/ui
- **AI SDK**: Vercel AI SDK (ai package)
- **语言**: TypeScript
- **包管理**: pnpm

### 关键依赖

- `react-markdown` + `remark-gfm` - Markdown 渲染
- `react-syntax-highlighter` - 代码语法高亮
- `next/font/google` - 字体加载（Geist、Inter、Noto Sans SC）

## 模块总览

| 模块 | 路径 | 描述 |
|---|---|---|
| Chatbot | `/chatbot` | 对话机器人基础：消息流、参数控制、滑动窗口上下文 |
| Prompt Engineering | `/prompt-engineering` | Prompt 设计技巧：System Prompt、Few-shot、CoT 等 |
| Tool Call | `/tool-call` | 工具调用 |
| MCP Protocol | `/mcp-protocol` | MCP 协议 |
| Intent Agent | `/intent-agent` | 意图识别 Agent |
| ReAct Agent | `/react-agent` | ReAct Agent |
| Chain of Thought | `/chain-of-thought` | 思维链/思维树 |
| Reflection Agent | `/reflection-agent` | 反思 Agent |
| Context Management | `/context-management` | 上下文管理 |
| Memory Management | `/memory-management` | 记忆管理 |
| RAG Agent | `/rag-agent` | RAG Agent |
| Multi-Agent | `/multi-agent` | 多Agent架构 |
| A2A Protocol | `/a2a-protocol` | A2A 协议 |
| A2UI Protocol | `/a2ui-protocol` | A2UI 协议 |

## 设计原则

- 每个模块包含「演示」和「文档」两个视图
- 支持滑动窗口上下文管理，自动压缩历史消息
- Markdown 文档支持代码高亮和目录导航
- 中英文字体栈：Geist → Inter → Noto Sans SC → system-ui
