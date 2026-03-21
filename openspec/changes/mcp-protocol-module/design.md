## Context

Agent Learn Lab 需要实现完整的 MCP Protocol 学习模块。当前 `mcp-protocol` 页面是 stub，需要实现：前端 UI 管理 MCP Server，后端 API Route 作为 MCP Client 代理。

**设计决策：MCP Client 放在后端 API Route，前端通过 API 与 MCP Server 通信。** 原因：
1. 支持所有 MCP Server（不受 CORS 限制）
2. API Key 可安全存储在后端环境变量
3. StreamableHTTP 的 POST + SSE 双通道可由 API Route 统一处理

## Goals / Non-Goals

**Goals:**
- 实现 MCP 模块完整功能（Tab：演示 / 文档）
- MCP Client 运行在后端 API Route，前端仅负责 UI 和状态管理
- 支持添加任意 MCP Server（StreamableHTTP 模式）
- 展示已连接 Server 的 Tools / Resources / Prompts 三大能力
- 调用 Tool / Resource / Prompt 并展示执行轨迹
- 复用 tool-call 的执行轨迹可视化

**Non-Goals:**
- 不实现任何内置 MCP Server
- 不内置任何 MCP Server 配置（models.config.json 不含 mcpServers）
- 不实现 MCP Server 端

## Decisions

### 1. 架构：后端 API Route 作为 MCP Client 代理

**Decision:** MCP Client（StreamableHTTPClientTransport）运行在 Next.js API Route，前端通过 REST API 与其通信。

```
┌─────────────┐      SSE + POST       ┌──────────────────┐
│   Browser  │ ◄──────────────────► │  /api/mcp/*      │
│  (Frontend) │    Next.js API      │  MCP Client      │
└─────────────┘                     │  (StreamableHTTP)│
                                     └────────┬─────────┘
                                              │ HTTP/SSE
                                     ┌────────▼─────────┐
                                     │ Remote MCP Server │
                                     │ (任意 Server)     │
                                     └──────────────────┘
```

**API Route 设计：**

| Method | Path | 说明 |
|---|---|---|
| `POST` | `/api/mcp/connect` | 建立与 MCP Server 的连接（传入 serverUrl） |
| `POST` | `/api/mcp/disconnect` | 断开当前连接 |
| `GET` | `/api/mcp/sse` | SSE 流，接收 MCP Server 的推送消息 |
| `POST` | `/api/mcp/tools` | 调用 listTools / callTool |
| `POST` | `/api/mcp/resources` | 调用 listResources / readResource |
| `POST` | `/api/mcp/prompts` | 调用 listPrompts / getPrompt |

**SSE 连接管理：** 后端维护 `Map<sessionId, MCPClient>`，前端通过 sessionId 标识会话。

### 2. 连接流程

**前端 → 后端 POST /api/mcp/connect：**
```
Body: { serverUrl: string, authHeader?: string }
Response: { sessionId: string }
```

**后端建立 StreamableHTTP 连接：**
```typescript
// /api/mcp/connect
const transport = new StreamableHTTPClientTransport(new URL(serverUrl));
const client = new Client({ name: 'agent-learn-lab', version: '1.0.0' });
await client.connect(transport);
// session 存入全局 Map
```

**前端通过 SSE 接收 Server 推送：** GET /api/mcp/sse?sessionId=xxx → 流式接收 Server 的 tool_call 等消息。

### 3. 前端 MCP Server 管理

**Decision:** 前端 UI 管理 Server 列表（存储在 localStorage），通过 API Route 与各 Server 通信。

**Server 配置（localStorage）：**
```typescript
interface McpServerConfig {
  id: string;
  name: string;
  serverUrl: string;   // StreamableHTTP endpoint
  authHeader?: string;  // 可选的 Bearer Token
}
```

**前端 UI 流程：**
```
添加 Server → POST /api/mcp/connect → 获取 sessionId → 保存到 localStorage
调用 Tool → POST /api/mcp/tools { sessionId, toolName, args }
断开 Server → POST /api/mcp/disconnect { sessionId }
```

### 4. 执行轨迹数据流

```
用户点击「执行」→ 前端 POST /api/mcp/tools
  → 后端调用 client.callTool()
  → MCP Server 返回结果
  → 后端将结果通过内部事件系统推送给前端 SSE
  → 前端更新 store.callLogs → 执行轨迹组件渲染
```

**注意：** 执行轨迹记录的是 MCP JSON-RPC 的 request/response，而非 HTTP 层面。

### 5. API Key 安全

**Decision:** 用户在前端 UI 输入的 API Key 通过 `authHeader` 传到后端，后端在建立连接时使用。不持久化到任何存储。

## 关键文件路径

| 文件 | 说明 |
|---|---|
| `src/app/mcp-protocol/page.tsx` | 主页面（改造现有 stub） |
| `src/app/mcp-protocol/lib/store.ts` | Zustand store |
| `src/app/api/mcp/connect/route.ts` | POST - 建立 MCP 连接 |
| `src/app/api/mcp/disconnect/route.ts` | POST - 断开 MCP 连接 |
| `src/app/api/mcp/sse/route.ts` | GET - SSE 流接收 Server 推送 |
| `src/app/api/mcp/tools/route.ts` | POST - listTools / callTool |
| `src/app/api/mcp/resources/route.ts` | POST - listResources / readResource |
| `src/app/api/mcp/prompts/route.ts` | POST - listPrompts / getPrompt |
| `src/app/mcp-protocol/components/` | UI 组件 |
| `src/app/mcp-protocol/docs/index.md` | Markdown 文档 |

## Risks / Trade-offs

- **[Risk] SSE 连接的 session 管理** → 后端需要维护 session 生命周期。** Mitigation**：使用 `Map<sessionId, {client, transport}>`，前端断开时清理。
- **[Trade-off] API Route 增加复杂度** → 需要维护连接状态、session 生命周期。** Mitigation**：session 管理逻辑集中在 API Route，不分散。
- **[Risk] SSE 断线重连** → 前端需要处理 SSE 连接断开事件。** Mitigation**：前端建立 SSE 连接时监听 `close` 事件，自动重连。

## Open Questions

1. **高德地图 MCP URL** → 是否提供？还是完全由用户提供？
2. **Server 连接超时** → 连接建立超时时间设置多少？
