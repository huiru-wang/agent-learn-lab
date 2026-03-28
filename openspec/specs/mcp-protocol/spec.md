# MCP Protocol Module

## ADDED Requirements

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: MCP Server 连接管理（前端 UI）

系统 SHALL 通过前端 UI 管理 MCP Server 的添加、连接和删除。

#### Scenario: 未连接状态（空状态）

- **WHEN** 演示区渲染且无已保存的 Server
- **THEN** 显示引导 UI：「暂无已连接的 MCP Server」，引导用户添加 Server

#### Scenario: 添加 MCP Server

- **WHEN** 用户点击「添加 Server」
- **THEN** 显示表单：Server 名称（必填）、Server URL（必填，StreamableHTTP endpoint）、认证 Header（可选）
- **WHEN** 用户填写表单并点击「连接」
- **THEN** 前端 POST /api/mcp/connect，返回 sessionId
- **THEN** Server 配置保存到 localStorage

#### Scenario: 连接状态显示

- **WHEN** MCP Server 连接成功
- **THEN** 显示绿色「已连接」状态 + Server 名称
- **THEN** 左侧面板显示 Tools / Resources / Prompts 数量

#### Scenario: 连接失败

- **WHEN** MCP Server 连接失败（网络错误 / 认证失败 / 连接超时）
- **THEN** 显示红色「连接失败」状态 + 错误原因
- **THEN** 不保存该 Server 配置

#### Scenario: 切换 Server

- **WHEN** 用户有多个已保存的 Server
- **THEN** 下拉列表中选择目标 Server 并点击「连接」

#### Scenario: 删除 Server

- **WHEN** 用户点击 Server 旁边的删除按钮
- **THEN** 从 localStorage 中移除该 Server 配置

### Requirement: MCP Client 代理（后端 API Route）

系统 SHALL 通过后端 API Route 运行 MCP Client，前端通过 API 与 MCP Server 通信。

#### Scenario: 建立连接 POST /api/mcp/connect

- **WHEN** 前端 POST /api/mcp/connect { serverUrl, authHeader? }
- **THEN** 后端创建 StreamableHTTPClientTransport 并建立连接
- **THEN** 后端返回 sessionId，前端通过 SSE GET /api/mcp/sse 接收 Server 推送

#### Scenario: SSE 消息接收 GET /api/mcp/sse

- **WHEN** 前端建立 SSE 连接（?sessionId=xxx）
- **THEN** 后端将 MCP Server 的所有消息（tools/list 响应、tool_call 结果等）通过 SSE 推送给前端

#### Scenario: 断开连接 POST /api/mcp/disconnect

- **WHEN** 前端 POST /api/mcp/disconnect { sessionId }
- **THEN** 后端关闭对应 session 的 MCP Client 和 transport，清理 session 记录

### Requirement: Tools 浏览器

系统 SHALL 在左侧面板展示已连接 MCP Server 的 Tools 列表。

#### Scenario: 显示 Tools 列表

- **WHEN** MCP Server 连接成功
- **THEN** 左侧面板 Tools Tab 显示可用工具列表，每个工具卡片显示：工具名、描述、参数说明

#### Scenario: 调用 Tool

- **WHEN** 用户选择工具、填写参数后点击「执行」
- **THEN** 前端 POST /api/mcp/tools { sessionId, toolName, arguments }
- **THEN** 工具执行完成后在执行轨迹中追加步骤，并显示结果

### Requirement: Resources 浏览器

系统 SHALL 在左侧面板展示已连接 MCP Server 的 Resources 列表。

#### Scenario: 显示 Resources 列表

- **WHEN** MCP Server 连接成功
- **WHEN** 用户切换到 Resources Tab
- **THEN** 显示可用 Resource URI 列表

#### Scenario: 读取 Resource

- **WHEN** 用户点击 Resource URI
- **WHEN** 前端 POST /api/mcp/resources { sessionId, method: "readResource", uri }
- **THEN** 在执行轨迹中追加 Resource Read 步骤，显示读取结果

### Requirement: Prompts 浏览器

系统 SHALL 在左侧面板展示已连接 MCP Server 的 Prompts 列表。

#### Scenario: 显示 Prompts 列表

- **WHEN** MCP Server 连接成功
- **WHEN** 用户切换到 Prompts Tab
- **THEN** 显示预定义提示词模板列表

#### Scenario: 使用 Prompt

- **WHEN** 用户点击 Prompt 模板
- **THEN** 显示模板变量填写表单
- **WHEN** 用户填写变量并点击「执行」
- **WHEN** 前端 POST /api/mcp/prompts { sessionId, name, arguments }
- **THEN** 显示返回的提示词内容

### Requirement: 执行轨迹可视化

系统 SHALL 在右侧面板实时展示 MCP 调用的执行轨迹。

#### Scenario: Tool Request 步骤

- **WHEN** 用户执行工具调用
- **THEN** 右侧追加「Tool Request: {toolName}」步骤（completed），显示 Request 按钮

#### Scenario: Tool Response 步骤

- **WHEN** 工具执行完成
- **THEN** 右侧追加「Tool Response: {toolName}」步骤（completed），显示 Response 按钮

#### Scenario: Resource Read 步骤

- **WHEN** 用户点击 Resource URI
- **THEN** 右侧追加「Resource Read: {uri}」步骤（completed），显示 Response 按钮

### Requirement: Request / Response 详情弹窗

用户点击 Request 或 Response 按钮时，系统 SHALL 弹出遮罩 Dialog 展示完整 JSON 内容。

#### Scenario: Request 详情

- **WHEN** 用户点击 Request 按钮
- **THEN** Dialog 显示 JSON 格式的完整 MCP JSON-RPC request body

#### Scenario: Response 详情

- **WHEN** 用户点击 Response 按钮
- **THEN** Dialog 显示 JSON 格式的完整 MCP JSON-RPC response body

### Requirement: 文档展示

系统 SHALL 在文档 Tab 中渲染 Markdown 格式的 MCP 协议说明文档。

#### Scenario: 显示文档

- **WHEN** 用户切换到文档 Tab
- **THEN** 渲染 mcp-protocol/docs/index.md 内容

#### Scenario: 快速添加教程

- **WHEN** 文档渲染
- **THEN** 包含 MCP Server 快速添加教程

## 核心概念

| 概念 | 说明 |
|---|---|
| MCP Server | 提供 Resources、Tools、Prompts 的服务端，通过 JSON-RPC 2.0 over StreamableHTTP 通信 |
| StreamableHTTP | 基于 HTTP POST（发送）+ SSE GET（接收）的双向流传输模式 |
| MCP Client 代理 | Next.js API Route 运行 MCP Client，前端通过 API 通信 |
| JSON-RPC 2.0 | MCP 协议的请求/响应格式 |
| Resources | MCP Server 提供的 URI 可寻址只读数据 |
| Tools | MCP Server 提供的可调用函数 |
| Prompts | MCP Server 提供的预定义提示词模板（含变量占位符） |

## 共享基础设施

MCP 相关类型和连接管理作为共享基础设施供所有 Agent 模块使用：

| 文件 | 说明 |
|---|---|
| `src/lib/tool-types.ts` | 共享工具类型定义 (`ToolDefinition`, `MCPTool`, `mcpToolNameToLocal`) |
| `src/lib/mcp-client.ts` | MCP 客户端工厂 (`createMCPClient`, `getMCPSession`, `closeMCPSession`) |
| `src/lib/config.ts` | MCP 配置读取 (`getMcpConfigs`) |
| `src/app/mcp-protocol/lib/mcp-session.ts` | MCP Protocol 模块自有的会话管理（独立于共享工厂） |

### MCP 工具命名规范 (SEP-986)

MCP 工具名称必须符合正则 `^[A-Za-z0-9._-]{1,128}$`，**不允许冒号 `:`**。

当多个 MCP Server 提供同名工具时，使用下划线前缀避免冲突：

```
amap_maps_streamableHTTP_search_nearby  // 格式: {serverName}_{toolName}
```

转换函数：

```typescript
import { mcpToolNameToLocal, localToolNameToMCP } from '@/lib/tool-types';

// MCP 工具名 → 本地工具名
mcpToolNameToLocal('search_nearby', 'amap-maps-streamableHTTP')
// → 'amap_maps_streamableHTTP_search_nearby'

// 本地工具名 → MCP 工具名
localToolNameToMCP('amap_maps_streamableHTTP_search_nearby')
// → { serverName: 'amap-maps-streamableHTTP', toolName: 'search_nearby' }
```
