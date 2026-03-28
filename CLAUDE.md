# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**Agent Learn Lab** 是一个 Next.js 教育型 Web 应用，从零开始教授 Agent 开发。通过可视化演示帮助学习者理解每个知识点的内部执行逻辑。中文项目。

## 常用命令

```bash
pnpm dev      # 开发模式
pnpm build    # 构建
pnpm lint     # ESLint 检查
```

## 技术栈

- **框架**: Next.js 15, React 19, TypeScript 5
- **UI**: Tailwind CSS 4, shadcn/ui, Lucide React
- **状态管理**: Zustand 5
- **AI/ML**: 自研 `llm-client.ts`（非 AI SDK）
- **协议**: `@modelcontextprotocol/sdk` 1.27
- **验证**: Zod 4.3
- **包管理**: pnpm

## 核心架构

### LLM 客户端 (`src/lib/llm-client.ts`)

项目使用自研 LLM 客户端，支持流式/非流式对话：

- `chatCompletion(options)` - 非流式，返回完整响应
- `chatCompletionStream(options)` - 流式，AsyncGenerator yield `StreamEvent`

**StreamEvent 类型**: `request` | `chunk` | `done` | `error` | `tool_call_complete`

**API 凭证解析优先级**:
1. `model.apiKey` / `model.baseUrl`
2. 环境变量 `PROVIDER_API_KEY` / `PROVIDER_BASE_URL`

### 模型配置

配置文件: `agent.config.json`（统一配置）

模型配置通过 `src/lib/config.ts` 的函数获取:
- `getModelConfigs()` - 获取所有模型
- `getModelConfigById(id)` - 按 ID 获取单个模型
- `getMainAgentModels()` - 获取 main agent 允许的模型列表
- `getAgentTools(agentName)` - 获取 agent 允许的工具
- `validateModelForAgent(agentName, modelId)` - 验证模型是否在 agent 允许列表中
- `getBuiltinMcpConfigs()` / `getMcpConfigs()` - 获取 MCP 服务器

### Agent 配置结构

```json
{
  "models": [...],     // 全局模型列表
  "mcps": {...},       // 全局 MCP 服务器配置
  "agents": {
    "main": {
      "name": "主 Agent",
      "models": ["qwen/qwen-max"],  // 允许的模型
      "tools": ["weather_api"],       // 本地工具
      "mcps": { "amap": { "tools": ["maps_geo"] } }  // MCP 工具
    }
  }
}
```

所有模块共用 `main` agent，模型选择受 agent 约束。

### MCP 协议集成

- `src/lib/react-mcp.ts` - MCP 客户端封装
- `src/components/mcp/` - MCP 相关 React 组件
- 支持 Local Stdio、Remote SSE、Remote StreamableHTTP 传输

### 模块结构约定

每个学习模块遵循统一结构:
```
[module]/
├── page.tsx              # 主页面
├── components/           # 模块组件
├── lib/                  # 业务逻辑（store, chat, registry）
├── api/                  # API 路由
├── docs/                 # 概念文档
└── spec.md               # 模块规格说明
```

### 模块规格

已实现模块的详细规格说明位于各模块目录的 `spec.md` 文件：

| 模块 | 路由 | 规格文件 |
|------|------|---------|
| Chatbot | `/chatbot` | `src/app/chatbot/spec.md` |
| Prompt Engineering | `/prompt-engineering` | `src/app/prompt-engineering/spec.md` |
| Tool Call | `/tool-call` | `src/app/tool-call/spec.md` |
| MCP Protocol | `/mcp-protocol` | `src/app/mcp-protocol/spec.md` |
| Intent Agent | `/intent-agent` | `src/app/intent-agent/spec.md` |
| ReAct Agent | `/react-agent` | `src/app/react-agent/spec.md` |

## 导航结构

| 分类 | 路由 |
|------|------|
| 首页 | `/` |
| 基础篇 | `/chatbot`, `/prompt-engineering`, `/tool-call` |
| 协议篇 | `/mcp-protocol` |
| 架构篇 | `/intent-agent`, `/react-agent`, `/chain-of-thought` |
| 系统篇 | `/context-management`, `/memory-management`, `/rag-agent` |
| 进阶篇 | `/multi-agent`, `/a2a-protocol`, `/a2ui-protocol` |

## API 设计规范

- 使用 Next.js App Router API Routes
- 流式响应使用 SSE (Server-Sent Events)
- 请求验证使用 Zod
- SSE 事件包含 `module` 和 `timestamp` 字段

### 关键 API 端点

- `POST /api/chat` - 通用聊天
- `POST /intent-agent/api/analyze` - 意图分析（SSE）
- `POST /react-agent/api/execute` - ReAct 执行（SSE）
- `GET/POST /api/mcp/*` - MCP 协议端点


## 注意事项

1. 所有文档、注释、UI 均为中文
2. 项目侧重教育目的，可视化演示优先于生产级代码
3. API 凭证存储在 `agent.config.json`，敏感信息不暴露给前端
