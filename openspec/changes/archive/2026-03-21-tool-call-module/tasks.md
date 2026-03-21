# Tasks: Tool Call Module

## 1. 目录结构与基础文件

- [x] 1.1 创建 tool-call 模块目录结构（components/、lib/、api/、docs/）
- [x] 1.2 替换 tool-call/page.tsx 为 Tab 布局页面（复用 chatbot 模式）
- [x] 1.3 创建 docs/docs.md 文档内容（工具调用概念说明）

## 2. Zustand Store

- [x] 2.1 创建 lib/store.ts - 定义 ToolCallState（messages、trace、isStreaming、currentToolCall、toolResult）
- [x] 2.2 创建 actions: addMessage、addTraceStep、updateTraceStep、setIsStreaming、setCurrentToolCall、setToolResult、clearAll

## 3. 工具注册表

- [x] 3.1 创建 lib/tool-registry.ts - 定义 get_time 的 JSON Schema
- [x] 3.2 创建 executeGetTime 函数（支持 timezone 和 format 参数，使用 Intl.DateTimeFormat）
- [x] 3.3 导出工具定义和执行函数映射

## 4. API Route

- [x] 4.1 创建 api/chat/route.ts - 接收 messages + tools 参数
- [x] 4.2 使用 streamText(..., { tools: [get_time] }) 调用 Vercel AI SDK
- [x] 4.3 实现 SSE 事件推送（chunk、tool_call_start、tool_result、done）
- [x] 4.4 使用 onToolCall 回调拦截工具调用，执行工具函数

## 5. 工具卡片组件

- [x] 5.1 创建 components/tool-list.tsx - 展示 get_time 工具卡片
- [x] 5.2 卡片显示：工具名、描述、参数说明（timezone/format）
- [x] 5.3 使用 Clock 图标，无勾选逻辑（仅单一内置工具）

## 6. 执行轨迹组件

- [x] 6.1 创建 components/execution-trace.tsx - 垂直时间线容器
- [x] 6.2 创建 components/trace-step.tsx - 单个步骤卡片（带状态图标：pending/active/completed）
- [x] 6.3 监听 SSE 事件，实时更新各个 Step 的状态和内容
- [x] 6.4 Step 3（工具执行）显示参数、状态、结果

## 7. 消息交互组件

- [x] 7.1 创建 components/chat-area.tsx - 输入框 + 消息列表
- [x] 7.2 输入框支持 Enter 发送，支持流式响应显示
- [x] 7.3 消息列表支持 assistant 消息流式打字效果

## 8. 主页面整合

- [x] 8.1 整合 tool-list + chat-area + execution-trace 为左右布局
- [x] 8.2 集成 Tabs（演示/文档），文档区复用 chatbot 的 DocsPanel
- [x] 8.3 连接 API 调用和 SSE 事件监听

## 9. 验证与测试

- [ ] 9.1 运行 dev server，验证「现在几点了？」调用 get_time 成功
- [ ] 9.2 验证右侧执行轨迹 5 个步骤依次展示
- [ ] 9.3 验证「纽约现在几点？」正确返回纽约时区时间
- [ ] 9.4 验证文档 Tab 正常渲染
- [x] 9.5 验证 Next.js build 无错误
