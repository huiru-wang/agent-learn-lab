## 1. 配置层扩展

- [ ] 1.1 扩展 `src/lib/config.ts` - 添加 `getMcpConfigs()` 读取 `models.config.json` 的 `mcp` 节点
- [ ] 1.2 定义 `McpConfig` 和 `McpServerConfig` 类型

## 2. MCP 客户端模块

- [ ] 2.1 创建 `src/app/react-agent/lib/mcp-client.ts`
- [ ] 2.2 实现 `loadMcpTools(mcpConfig)` - 遍历配置的 MCP Server，建立连接，获取工具列表
- [ ] 2.3 实现 `callMcpTool(client, toolName, args)` - 调用 MCP 工具并返回结果
- [ ] 2.4 实现 `cleanupMcpClients(clients)` - 清理所有 MCP 连接

## 3. 本地工具实现

- [ ] 3.1 创建 `src/app/react-agent/lib/local-tools.ts`
- [ ] 3.2 实现 `get_current_time()` - 返回当前日期时间、时区信息
- [ ] 3.3 实现 `get_location()` - 返回模拟位置信息（lat/lon/city）
- [ ] 3.4 导出 `LOCAL_TOOLS` 数组（包含工具元数据）

## 4. 统一工具注册表

- [ ] 4.1 扩展 `src/app/react-agent/lib/tools.ts` - 添加 MCP 工具类型 `ToolName` 前缀
- [ ] 4.2 扩展 `Tool` 接口添加 `isLocal: boolean` 字段
- [ ] 4.3 更新 `TOOL_COLORS` 添加本地工具颜色（紫色 get_current_time、靛蓝 get_location）
- [ ] 4.4 实现 `executeTool()` 支持自动路由到本地/MCP/模拟工具
- [ ] 4.5 导出 `buildUnifiedTools(localTools, mcpTools)` - 合并所有工具

## 5. API Route 修改

- [ ] 5.1 修改 `src/app/react-agent/api/execute/route.ts`
- [ ] 5.2 添加 MCP 配置加载逻辑
- [ ] 5.3 添加 MCP Client 创建和工具加载
- [ ] 5.4 修改工具执行逻辑，支持 `callMcpTool()`
- [ ] 5.5 在请求结束前添加 `cleanupMcpClients()`
- [ ] 5.6 错误处理：MCP 连接失败时降级为仅本地工具

## 6. 前端组件更新

- [ ] 6.1 更新 `src/app/react-agent/components/ToolSelector.tsx`
- [ ] 6.2 添加工具分组显示（本地工具 / MCP 工具）
- [ ] 6.3 MCP 工具区显示 Server 名称（"🗺️ 高德地图"）
- [ ] 6.4 确保选中状态正确同步到 store

## 7. 测试验证

- [ ] 7.1 测试本地工具独立调用（get_current_time、get_location）
- [ ] 7.2 测试 MCP 工具调用（amap-maps-streamableHTTP:search_nearby）
- [ ] 7.3 测试示例任务 1："北京今天明天天气怎么样？推荐附近的景点"
- [ ] 7.4 测试示例任务 2："帮我推荐附近的饭店，今天想吃辣的"
- [ ] 7.5 测试 MCP Server 不可用时的降级处理
