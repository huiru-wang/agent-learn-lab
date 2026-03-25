## Why

ReAct (Reasoning + Acting) 是 Agent 开发的核心模式之一，目前项目中的 `/react-agent` 页面只是一个占位页面（"开发中"状态）。实现这个模块将帮助学习者可视化理解 Thought-Action-Observation 循环的执行过程，是 Agent Learn Lab 教学路径中"架构篇"的关键组成部分。

## What Changes

- 将 `/react-agent` 页面从占位页面实现为完整的 ReAct Agent 演示
- 添加任务输入功能，支持用户输入自然语言任务
- 添加可用工具选择列表（weather_api、calculator、search 等）
- 实现执行轨迹面板，实时展示 Thought → Action → Observation 循环
- 添加调试控制：单步执行、继续执行、轨迹回放
- 工具调用使用原生 `llm-client.ts`（非 AI SDK）
- 添加 `docs/index.md` 文档说明 ReAct 核心概念

## Capabilities

### New Capabilities

- `react-agent-ui`: ReAct Agent 演示界面，包含任务输入、工具选择、执行轨迹展示
- `react-agent-execution`: ReAct 循环执行引擎，通过 SSE 流式返回每一步的 Thought/Action/Observation
- `react-agent-debug`: 调试控制能力，支持单步执行、暂停、继续、回放

### Modified Capabilities

- `intent-agent`: 参考其 SSE 流式处理模式和 UI 组件结构，但 react-agent 有不同的执行模型（循环 vs 单次）

## Impact

- **新增文件**:
  - `src/app/react-agent/page.tsx` - 主页面
  - `src/app/react-agent/components/` - UI 组件
  - `src/app/react-agent/lib/store.ts` - Zustand 状态管理
  - `src/app/react-agent/lib/chat.ts` - SSE 客户端
  - `src/app/react-agent/lib/tools.ts` - 可用工具定义
  - `src/app/react-agent/api/execute/route.ts` - 执行 API
  - `src/app/react-agent/docs/index.md` - 概念文档

- **依赖**:
  - `src/lib/llm-client.ts` - LLM 调用
  - `src/lib/config.ts` - 模型配置
  - 已有的 intent-agent 组件模式
