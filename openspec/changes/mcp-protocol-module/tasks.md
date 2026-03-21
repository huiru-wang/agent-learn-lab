# Tasks: MCP Protocol Module

## 1. 目录结构与基础文件

- [x] 1.1 创建 mcp-protocol 模块目录结构（components/、lib/、docs/）
- [x] 1.2 创建 API Route 目录结构（api/mcp/connect/、api/mcp/disconnect/、api/mcp/sse/、api/mcp/tools/、api/mcp/resources/、api/mcp/prompts/）
- [x] 1.3 改造 mcp-protocol/page.tsx 为 Tab 布局（复用 tool-call 模式：演示/文档）
- [x] 1.4 创建 docs/index.md 文档（MCP 协议概念、StreamableHTTP、添加 Server 教程）
- [x] 1.5 验证 `@modelcontextprotocol/sdk` StreamableHTTPClientTransport 可在后端运行

## 2. MCP Client 会话管理（后端 lib）

- [x] 2.1 创建 lib/mcp-session.ts — 全局 session 管理（Map<sessionId, {client, transport}>）
- [x] 2.2 实现 `createSession(serverUrl, authHeader?)` — 创建 transport + client + 连接，返回 sessionId
- [x] 2.3 实现 `getSession(sessionId)` — 获取 session
- [x] 2.4 实现 `deleteSession(sessionId)` — 关闭连接并删除 session

## 3. API Routes（后端 MCP Client 代理）

- [x] 3.1 POST /api/mcp/connect — 接收 serverUrl + authHeader，建立 MCP 连接，返回 sessionId
- [x] 3.2 POST /api/mcp/disconnect — 接收 sessionId，调用 deleteSession
- [x] 3.3 GET /api/mcp/sse — SSE 流化，建立流读取循环，将 MCP Server 的所有消息推送给前端
- [x] 3.4 POST /api/mcp/tools — 接收 sessionId + toolName + arguments，调用 client.callTool()
- [x] 3.5 POST /api/mcp/resources — 接收 sessionId + method + uri，调用 client.listResources() 或 client.readResource()
- [x] 3.6 POST /api/mcp/prompts — 接收 sessionId + name + arguments，调用 client.listPrompts() 或 client.getPrompt()

## 4. Zustand Store（前端）

- [x] 4.1 创建 lib/store.ts — 定义 MCPState（connectionStatus、currentSessionId、servers[]、tools、resources、prompts、callLogs）
- [x] 4.2 创建 actions: addServer、removeServer、connectServer、disconnectServer、callTool、readResource、getPrompt、clearLogs
- [x] 4.3 localStorage 持久化已保存的 Server 列表（不含 authHeader）

## 5. Server 连接状态组件

- [x] 5.1 创建 components/server-panel.tsx — Server 选择下拉 + 连接/断开按钮 + 状态显示
- [x] 5.2 空状态引导 UI（提示添加 Server）
- [x] 5.3 「添加 Server」表单（名称 + URL + 可选认证 Header）
- [x] 5.4 已保存 Server 列表（点击连接 / 删除）

## 6. 工具卡片组件

- [x] 6.1 创建 components/tool-list.tsx — 展示 MCP Server 的 Tools 列表（Tools Tab）
- [x] 6.2 工具卡片显示：工具名、描述、参数说明
- [x] 6.3 点击工具展开参数表单（动态根据 tool.inputSchema 渲染）

## 7. MCP 交互面板

- [x] 7.1 创建 components/interaction-panel.tsx — 参数输入 + 执行按钮
- [x] 7.2 调用 callTool 并显示执行结果
- [x] 7.3 调用 readResource 并显示读取内容
- [x] 7.4 调用 getPrompt 并显示返回的提示词内容

## 8. 执行轨迹组件

- [x] 8.1 创建 components/execution-trace.tsx — 垂直时间线容器（参考 tool-call 的 execution-trace）
- [x] 8.2 创建 components/trace-step.tsx — 单个步骤卡片（带 Request/Response 详情按钮）
- [x] 8.3 复用 store.callLogs 实时更新轨迹状态

## 9. 资源浏览器与提示词

- [x] 9.1 创建 components/resource-browser.tsx — Resources 列表 + 点击读取（Resources Tab）
- [x] 9.2 创建 components/prompt-browser.tsx — Prompts 列表 + 模板变量表单（Prompts Tab）
- [x] 9.3 三个浏览器整合到左侧边栏（Tab 切换：Tools / Resources / Prompts）

## 10. 主页面整合

- [x] 10.1 整合 server-panel + tool-list + resource-browser + prompt-browser 为左侧面板
- [x] 10.2 整合 interaction-panel + execution-trace 为右侧面板
- [x] 10.3 连接 MCP Client（API Route）和 Store 的状态同步

## 11. 验证与测试

- [x] 11.1 验证 Next.js build 无错误
- [ ] 11.2 验证前端「添加 MCP Server」UI 正常
- [ ] 11.3 验证连接公共 MCP Server（如 nunjucks 等）成功
- [ ] 11.4 验证 Tools 列表正常显示
- [ ] 11.5 验证 Tool 调用成功（执行轨迹正确展示 Request / Response 步骤）
- [ ] 11.6 验证 Resources 和 Prompts 浏览功能
- [ ] 11.7 验证文档 Tab 正常渲染
