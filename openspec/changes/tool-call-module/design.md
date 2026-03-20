# Design: Tool Call Module

## Context

Agent Learn Lab 的 chatbot 模块已实现基础的流式对话功能，但不支持工具调用。Tool Call 模块作为独立页面，需要在 `/tool-call` 路径下实现完整的工具调用演示。

项目使用 Next.js App Router + Vercel AI SDK，`streamText` API 原生支持 `tools` 参数。chatbot 模块的 API 在 `/chatbot/api/chat`，采用 SSE 流式响应。Tool Call 模块将复用相同的架构模式，但扩展支持工具调用。

## Goals / Non-Goals

**Goals:**
- 实现内置 `get_time` 工具的完整调用流程
- 可视化展示模型推理 → 工具选择 → 执行 → 结果注入 → 最终回答的全过程
- 保持与 chatbot 模块一致的 UI 风格和组件模式
- 复用 chatbot 的 DocsPanel 组件渲染文档

**Non-Goals:**
- 不支持自定义工具（仅内置 `get_time`）
- 不支持 tool_choice 参数强制/禁止工具
- 不做持久化存储（工具配置仅内存持有）
- 不实现多工具协作（第一版本仅单一工具）

## Decisions

### 1. API 架构：复用 streamText + tools

使用 `streamText(..., { tools: [toolDefinition] })`，Vercel AI SDK 自动处理：
- 工具调用的触发检测
- tool_call 块的生成
- tool result 的自动追加（`addTools`）

**SSE 事件设计：**
```typescript
type SSEEvent =
  | { type: 'chunk'; delta: string }                              // 推理文本片段
  | { type: 'tool_call_start'; toolName: string; args: object }   // 工具调用开始
  | { type: 'tool_result'; result: object }                        // 工具执行结果
  | { type: 'tool_call_error'; error: string }                     // 工具执行错误
  | { type: 'done'; text: string; finishReason: string }            // 最终回答完成
```

**优点：** Vercel AI SDK 的 `streamText` 会自动将 tool_result 追加到 messages 数组，前端只需监听事件并可视化。

**替代方案：** 自己解析 OpenAI 的 `function_call` 格式，工作量大且易出错。

### 2. 工具执行：本地 Node.js 执行

`get_time` 工具在服务端执行，使用 `Intl.DateTimeFormat` 获取各时区时间，不依赖外部 API。

```typescript
function executeGetTime(args: { timezone?: string; format?: string }) {
  const tz = args.timezone || 'Asia/Shanghai';
  const fmt = args.format || 'full';
  const now = new Date();
  const localeStr = now.toLocaleString('zh-CN', { timeZone: tz });
  const date = now.toLocaleDateString('zh-CN', { timeZone: tz });
  const time = now.toLocaleTimeString('zh-CN', { timeZone: tz });
  return {
    timezone: tz,
    date,
    time,
    full: localeStr,
  }[fmt];
}
```

### 3. 前端状态：Zustand Store

工具调用涉及多个阶段的状态（idle / reasoning / tool_calling / executing / responding），使用 Zustand 统一管理。

Store 结构：
```typescript
interface ToolCallState {
  messages: Message[];
  trace: TraceStep[];        // 执行轨迹
  isStreaming: boolean;
  currentToolCall: { name: string; args: object } | null;
  toolExecutionResult: object | null;
  enabledTools: ToolDefinition[];
}
```

### 4. 执行轨迹可视化

右侧面板按时间线展示 5 个阶段：
- Step 1: 用户输入（输入框内容）
- Step 2: 模型推理（chunk 文本流 + tool call 识别）
- Step 3: 工具执行（参数 → 执行中 → 结果）
- Step 4: 结果注入（tool 消息追加）
- Step 5: 最终回答（完整文本）

使用垂直时间线 + 步骤卡片实现，每个步骤包含状态图标。

### 5. 页面布局

```
┌────────────────────────────────────────────────────────────────────┐
│ [演示] [文档]                                                       │
├─────────────────────────────────┬──────────────────────────────────┤
│ 左侧 (60%): 交互区             │ 右侧 (40%): 执行轨迹            │
│                                  │                                   │
│ [get_time 工具卡片]             │ [Step 1] 用户输入                 │
│ "🔧 get_time - 获取当前时间"   │ "现在几点了？"                   │
│                                  │                                   │
│ ┌────────────────────────────┐ │ [Step 2] 模型推理                 │
│ │ 现在几点了？              │ │ "我需要调用 get_time 工具..."    │
│ └────────────────────────────┘ │                                   │
│                        [发送]  │ [Step 3] 工具执行                 │
│                                  │ { timezone: "Asia/Shanghai" }   │
│ ┌────────────────────────────┐ │ "✓ 执行完成 → 2026-03-20 ..."   │
│ │ 根据查询结果，现在是...    │ │                                   │
│ └────────────────────────────┘ │ [Step 5] 最终回答                 │
│                                  │ "现在是 2026年3月20日..."        │
└─────────────────────────────────┴──────────────────────────────────┘
```

### 6. 组件复用策略

| 组件 | 来源 |
|---|---|
| Tabs (演示/文档) | 复用 chatbot/page.tsx 的 Tab 模式 |
| DocsPanel | 复用 `src/app/chatbot/components/docs-panel.tsx` |
| InputPanel | 简化复用 chatbot 的输入逻辑 |

## Risks / Trade-offs

- [Risk] Vercel AI SDK 的 tool_call 事件流格式可能变化 → Mitigation：监听 `onToolCall` 回调，不直接解析底层事件
- [Risk] 时区转换依赖 Node.js 服务端时区配置 → Mitigation：使用 IANA 时区名称（兼容性好）
- [Trade-off] 仅单一工具 vs 多工具 → 第一版简化，后续扩展只需在 registry 中添加工具
