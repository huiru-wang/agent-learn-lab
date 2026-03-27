## Why

当前的 `react-agent` 模块使用模拟工具（weather_api、calculator、search），无法展示真实工具调用能力。通过集成 MCP (Model Context Protocol)，可以利用高德地图等真实 MCP Server 实现位置感知功能。结合本地工具 `get_location()` 和 `get_current_time()`，可以让 ReAct Agent 执行更具实用性的任务，如"今天明天天气怎么样？推荐附近的景点"。

## What Changes

### 1. MCP 集成
- 从 `models.config.json` 读取 MCP Server 配置
- 通过 `@modelcontextprotocol/sdk` 的 `StreamableHTTPClientTransport` 连接 MCP Server
- 将 MCP Remote Tools 合并到 ReAct Agent 的工具列表

### 2. 新增本地工具
- `get_location()` - 返回当前设备位置（经纬度或城市名）
- `get_current_time()` - 返回当前日期时间

### 3. 统一工具注册表
- `lib/tools.ts` 扩展为支持本地工具 + MCP 远程工具的统一结构
- 工具执行时自动路由到正确实现（本地函数 vs MCP 调用）

### 4. 示例任务更新
- "北京今天明天天气怎么样？推荐附近的景点"
- "帮我推荐附近的饭店，今天想吃辣的"

## Capabilities

### New Capabilities
- `react-agent-mcp-tools`: 从配置加载 MCP Server 并获取远程工具
- `react-agent-local-tools`: `get_location()`、`get_current_time()` 本地工具实现

### Modified Capabilities
- `react-agent-execution`: 扩展工具执行逻辑，支持本地工具和 MCP 工具的统一调用

## Impact

### 新增文件
- `src/app/react-agent/lib/mcp-client.ts` - MCP Server 连接管理
- `src/app/react-agent/lib/local-tools.ts` - 本地工具实现

### 修改文件
- `src/app/react-agent/lib/tools.ts` - 扩展为统一工具注册表
- `src/app/react-agent/api/execute/route.ts` - 支持 MCP 工具调用
- `src/app/react-agent/components/ToolSelector.tsx` - 显示 MCP 工具

### 依赖
- `@modelcontextprotocol/sdk` - MCP 客户端库
- `models.config.json` 中的 `mcp` 配置节点
