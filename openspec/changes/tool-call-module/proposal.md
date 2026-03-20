# Proposal: Tool Call Module

## Why

Agent Learn Lab 需要一个专门的 Tool Call 模块，帮助开发者直观理解 Function Calling 机制。通过内置的 `get_time` 工具和实时可视化，用户可以完整观察模型如何识别工具调用意图、如何构造参数、如何执行工具、如何整合结果的全过程。

## What Changes

- 新增 `/tool-call` 页面，包含「演示」和「文档」两个 Tab
- 内置 `get_time` 工具：支持 timezone 和 format 参数，通过 `streamText(..., { tools })` 触发真实工具调用
- 执行轨迹可视化：5 阶段时间线（输入 → 推理 → 工具调用 → 执行结果 → 最终回答）
- 消息交互区：输入框 + 模型回复展示
- 工具卡片展示：展示 `get_time` 的名称、描述、参数说明

## Capabilities

### New Capabilities

- `tool-call-module`: Tool Call 学习模块，包含工具卡片、交互区、执行轨迹可视化

### Modified Capabilities

- (none)

## Impact

- `src/app/tool-call/page.tsx` - 主页面（替换现有的 placeholder）
- `src/app/tool-call/api/chat/route.ts` - 支持 `tools` 参数的 SSE 流 API
- `src/app/tool-call/components/tool-list.tsx` - 工具卡片列表
- `src/app/tool-call/components/execution-trace.tsx` - 执行轨迹时间线
- `src/app/tool-call/components/chat-area.tsx` - 消息交互区
- `src/app/tool-call/lib/store.ts` - Zustand store
- `src/app/tool-call/lib/tool-registry.ts` - 工具定义 + 执行函数
- `src/app/tool-call/docs/index.md` - 文档内容
