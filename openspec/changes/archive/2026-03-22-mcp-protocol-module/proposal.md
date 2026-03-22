## Why

Agent Learn Lab 需要实现完整的 MCP Protocol 学习模块。当前 `mcp-protocol` 页面是 stub，需要实现：

1. **纯前端添加 MCP Server**：用户通过 UI 输入 MCP Server URL（StreamableHTTP 模式），无需内置 Demo Server
2. **展示 MCP 三大能力**：Tools / Resources / Prompts 的发现与调用
3. **执行轨迹可视化**：复用 tool-call 的轨迹机制展示 MCP 调用的 request/response

**设计原则：不做内置 MCP Server，全部由用户提供。** 这样模块职责清晰——专注展示 MCP 协议连接与管理能力，而非内置工具。

## What Changes

- 新增 `mcp-protocol` 模块页面（Tab 布局：演示 / 文档）
- **纯前端添加 MCP Server**：用户输入 MCP Server URL（StreamableHTTP），浏览器直连
- 复用 tool-call 的执行轨迹可视化，展示 MCP 工具调用的 request/response
- `models.config.json` 中**不再内置** MCP Server 配置
- tool-call 模块**保持独立**，不与 MCP 模块融合

## Capabilities

### New Capabilities

- **mcp-streamable-http**: Remote StreamableHTTP 传输支持，允许前端直接连接远程 MCP Server
- **mcp-ui**: MCP Server 连接管理 UI（添加/删除/切换 Server，展示 Tools/Resources/Prompts）

### Modified Capabilities

- `tool-call`: 现有 tool-call 模块**不受影响**，保持独立

## Impact

- **新增模块**: `src/app/mcp-protocol/`（components/、lib/、docs/）
- **依赖**: `@modelcontextprotocol/sdk`（已安装）；无需新增依赖
- **复用**: 复用 tool-call 的 `execution-trace` 可视化组件
- **不修改**: `tool-call` 模块、`/api/chat` 等现有 API
