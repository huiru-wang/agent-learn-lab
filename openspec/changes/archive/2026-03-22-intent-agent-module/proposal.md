## Why

Intent Agent 是 Agent 开发学习路径中的关键模块，位于 Phase 3（Agent 模块）的首位。当前 `/intent-agent` 页面仅为 stub 占位页，用户无法学习意图识别的核心概念（Intent Classification、Slot Filling、Multi-Intent）。作为从基础 Tool Call / MCP 向高级 Agent 模式过渡的桥梁模块，需要优先实现。

## What Changes

- 新增 Intent Agent 演示页面，支持用户输入自然语言并实时展示意图识别结果
- 实现意图分类 + 槽位提取 + 多意图识别 的完整后端 API（基于 LLM structured output）
- 实现预定义意图列表管理（内置 book_flight、book_hotel、query_weather、cancel_order 等场景）
- 右侧面板可视化展示：主意图 + 置信度进度条 + 槽位提取表格 + 多意图优先级
- 新增学习文档，涵盖意图识别原理、槽位填充技术、多意图处理策略
- 复用 DocsPanel 组件渲染「文档」Tab

## Capabilities

### New Capabilities
- `intent-agent-demo`: 意图识别演示功能，包括用户输入分析、预定义意图管理、意图分类 + 槽位提取的交互流程
- `intent-agent-docs`: Intent Agent 学习文档，覆盖意图识别原理、槽位填充、多意图处理等核心概念

### Modified Capabilities
（无需修改已有模块的 spec 级行为）

## Impact

- **新增页面**: `src/app/intent-agent/page.tsx` 替换当前 stub
- **新增组件**: `src/app/intent-agent/components/` 下的 input-panel、result-panel、intent-list 等组件
- **新增 API**: `src/app/intent-agent/api/analyze/route.ts` 意图分析 API（调用 LLM + structured output）
- **新增文档 API**: `src/app/intent-agent/api/docs/route.ts`
- **新增文档**: `src/app/intent-agent/docs/index.md`
- **新增 Store**: `src/app/intent-agent/lib/store.ts` (Zustand)
- **复用**: `src/app/chatbot/components/docs-panel.tsx` (DocsPanel)、`src/lib/llm-client.ts`、`src/lib/config.ts`
