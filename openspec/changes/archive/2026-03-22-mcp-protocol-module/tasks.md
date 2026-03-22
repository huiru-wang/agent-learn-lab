# Tasks: MCP Protocol Module (v2 - Redesigned)

## 架构变更说明

MCP 模块已重新设计为**聊天 Agent**模式：
- 左侧（40%）：执行轨迹
- 右侧（60%）：Server Panel + Chat Area
- 不再需要独立的 Tools/Resources/Prompts 浏览器
- MCP 工具通过聊天中的 LLM 自动发现和调用

## 1. 目录结构与基础文件

- [x] 1.1 创建 mcp-protocol 模块目录结构（components/、lib/、docs/）
- [x] 1.2 创建 API Route 目录结构（api/mcp/connect/、api/mcp/disconnect/、api/mcp/sse/、api/mcp/tools/、api/mcp/resources/、api/mcp/prompts/、api/mcp/chat/）
- [x] 1.3 改造 mcp-protocol/page.tsx 为 Tab 布局（演示/文档）
- [x] 1.4 创建 docs/index.md 文档
- [x] 1.5 验证 `@modelcontextprotocol/sdk` 可在后端运行

## 2. MCP Client 会话管理（后端 lib）

- [x] 2.1 创建 lib/mcp-session.ts — 全局 session 管理
- [x] 2.2 实现 `createSession(serverUrl, authHeader?)`
- [x] 2.3 实现 `getSession(sessionId)`
- [x] 2.4 实现 `deleteSession(sessionId)`

## 3. API Routes

### 已有 Routes（Session 管理 + 工具调用）

- [x] 3.1 POST /api/mcp/connect
- [x] 3.2 POST /api/mcp/disconnect
- [x] 3.3 GET /api/mcp/sse
- [x] 3.4 POST /api/mcp/tools
- [x] 3.5 POST /api/mcp/resources
- [x] 3.6 POST /api/mcp/prompts

### 新增 Route（聊天 Agent）

- [x] 3.7 POST /api/mcp/chat — **聊天 API**，实现 agentic loop：
  - 获取 MCP session 和工具列表
  - 将 MCP 工具转换为 OpenAI function 格式
  - 调用 `chatCompletionStream` 实现 agentic loop
  - SSE 流化：llm_request, chunk, llm_response, tool_call, tool_result

## 4. Zustand Store

- [x] 4.1 创建 lib/store.ts — connectionStatus, currentSessionId, servers[], callLogs
- [x] 4.2 创建 actions: addServer, removeServer, setConnectionStatus, setCurrentSession, addCallLog, clearCallLogs
- [x] 4.3 localStorage 持久化 servers（不含 authHeader）

## 5. Server 连接组件

- [x] 5.1 创建 components/server-panel.tsx
- [x] 5.2 空状态引导 UI
- [x] 5.3 「添加 Server」表单
- [x] 5.4 已保存 Server 列表（连接/删除）

## 6. 执行轨迹组件

- [x] 6.1 创建 components/execution-trace.tsx
- [x] 6.2 创建 components/trace-step.tsx

## 7. 聊天组件

- [x] 7.1 创建 components/chat-area.tsx
  - SSE 事件处理（llm_request, chunk, llm_response, tool_call, tool_result）
  - 更新 store.callLogs 以驱动 ExecutionTrace
  - 模型选择器
  - 消息历史

## 8. 布局整合

- [x] 8.1 左侧（40%）：ExecutionTrace
- [x] 8.2 右侧（60%）：ServerPanel + ChatArea（垂直堆叠）
- [x] 8.3 移除不再需要的组件（tool-list, resource-browser, prompt-browser, interaction-panel）

## 9. 验证

- [x] 9.1 `pnpm build` 无错误
- [ ] 9.2 验证前端「添加 MCP Server」UI 正常
- [ ] 9.3 验证连接 MCP Server 成功
- [ ] 9.4 验证聊天中 LLM 调用 MCP 工具成功
- [ ] 9.5 验证执行轨迹正确展示 Request / Tool Call / Tool Result / Response
- [ ] 9.6 验证文档 Tab 正常渲染
