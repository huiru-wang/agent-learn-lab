## Context

`react-agent` 模块当前使用模拟工具，需要扩展为支持：
1. **MCP 远程工具**：从 `models.config.json` 读取配置，连接 `amap-maps-streamableHTTP` Server
2. **本地工具**：`get_location()` 和 `get_current_time()`

**设计约束：**
- MCP 客户端使用 `@modelcontextprotocol/sdk` 的 `StreamableHTTPClientTransport`
- 工具注册表统一管理本地工具和 MCP 工具
- 复用现有的 SSE 流式返回模式

## Goals / Non-Goals

**Goals:**
- 从 `models.config.json` 加载 MCP Server 配置
- 连接 MCP Server 并获取可用工具列表
- 实现 `get_location()` 和 `get_current_time()` 本地工具
- 统一工具执行入口，自动路由到本地或 MCP 实现

**Non-Goals:**
- 不实现 MCP Server 管理 UI（参见 mcp-protocol 模块）
- 不实现 MCP 工具的持续连接管理（MCP 连接在请求结束时关闭）

## Decisions

### 1. MCP 配置读取

**Decision:** 从 `models.config.json` 的 `mcp` 节点读取 MCP Server 配置。

```typescript
// src/lib/config.ts 扩展
interface McpConfig {
  [serverName: string]: {
    url: string;
    authHeader?: string;
  };
}

// 返回 { "amap-maps-streamableHTTP": { url: "https://mcp.amap.com/mcp?key=..." } }
export async function getMcpConfigs(): Promise<McpConfig>
```

**理由：** 与现有模型配置读取模式一致，无需额外配置文件。

### 2. MCP 工具加载

**Decision:** 在每次 `/api/execute` 请求时，动态加载并连接 MCP Server。

**MCP 工具命名规范 (SEP-986):** 工具名必须符合 `^[A-Za-z0-9._-]{1,128}$`，不允许冒号 `:`。

```typescript
// api/execute/route.ts
import { mcpToolNameToLocal } from '@/lib/tool-types';

async function loadMcpTools(mcpConfig: McpConfig) {
  const tools = [];
  for (const [serverName, serverConfig] of Object.entries(mcpConfig)) {
    const { client } = await createSession(serverConfig.url, serverConfig.authHeader);
    const mcpTools = await client.listTools();
    // 转换 MCP 工具格式为 ReAct 工具格式
    // 使用下划线前缀避免命名冲突: amap_maps_streamableHTTP_search_nearby
    tools.push(...mcpTools.tools.map(t => ({
      name: mcpToolNameToLocal(t.name, serverName), // 例如: amap_maps_streamableHTTP_search_nearby
      description: t.description,
      parameters: t.inputSchema,
    })));
  }
  return tools;
}
```

**理由：**
- 每次请求独立，不维护持久连接
- 简化错误处理和资源清理
- 与模拟工具调用模式一致
- 下划线前缀符合 MCP 工具命名规范

### 3. 本地工具实现

**Decision:** 本地工具作为 TypeScript 函数实现。

```typescript
// lib/local-tools.ts
export function get_current_time(args: Record<string, unknown>): string {
  return JSON.stringify({
    datetime: new Date().toLocaleString('zh-CN'),
    timestamp: Date.now(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}

export function get_location(args: Record<string, unknown>): string {
  // 实际实现中可以通过 IP 定位或浏览器 Geolocation API
  // 这里返回模拟数据作为演示
  return JSON.stringify({
    city: '北京市',
    latitude: 39.9042,
    longitude: 116.4074,
  });
}

export const LOCAL_TOOLS = [
  {
    name: 'get_current_time',
    description: '获取当前日期时间信息',
    color: 'border-purple-500',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_location',
    description: '获取当前位置（城市、经纬度）',
    color: 'border-indigo-500',
    parameters: { type: 'object', properties: {}, required: [] },
  },
];
```

### 4. 统一工具注册表

**Decision:** `lib/tools.ts` 扩展为包含所有工具的统一结构。

```typescript
// lib/tools.ts
import { localToolNameToMCP } from '@/lib/tool-types';

export type ToolName = 'weather_api' | 'calculator' | 'search'
  | 'get_current_time' | 'get_location'
  | 'amap_maps_streamableHTTP_search_nearby';  // MCP tools with underscore prefix

export interface Tool {
  name: ToolName;
  description: string;
  color: string;
  parameters: ToolSchema;
  isLocal: boolean;  // true for local tools, false for MCP tools
}

// 工具执行入口
export function executeTool(
  toolName: ToolName,
  args: Record<string, unknown>,
  mcpClients?: Map<string, Client>
): string {
  if (toolName === 'get_current_time') {
    return localTools.get_current_time(args);
  }
  // ... 其他本地工具

  // MCP 工具格式: "serverName_toolName" (下划线分隔，不允许冒号)
  const mcpInfo = localToolNameToMCP(toolName);
  if (mcpInfo) {
    const client = mcpClients?.get(mcpInfo.serverName);
    if (client) {
      // 调用 MCP 工具
      const result = await client.callTool(mcpInfo.toolName, args);
      return JSON.stringify(result);
    }
  }
  // ... 模拟工具
}
```

### 5. 工具选择 UI

**Decision:** `ToolSelector.tsx` 扩展为支持分组显示本地工具和 MCP 工具。

```
┌─────────────────────────────┐
│ 🔧 可用工具                   │
│                             │
│ 📍 本地工具                  │
│   ☑ get_current_time        │
│   ☑ get_location            │
│                             │
│ 🗺️ MCP 工具 (高德地图)      │
│   ☑ search_nearby           │
│   ☑ weather                 │
│   ☐ location_to_geo         │
└─────────────────────────────┘
```

## 工具执行流程

```
用户输入任务 → 选择工具 → POST /api/execute
                                     │
                                     ▼
                              加载 MCP 配置
                                     │
                                     ▼
                          连接 MCP Server（如有）
                                     │
                                     ▼
                        构建统一工具列表（本地 + MCP）
                                     │
                                     ▼
                         调用 LLM + Tools
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
            本地工具调用                         MCP 工具调用
            (直接执行)                          (client.callTool)
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                              SSE 返回结果
                                     │
                                     ▼
                              清理 MCP 连接
```

## 示例任务

### 任务 1: 天气查询 + 景点推荐
```
用户: "北京今天明天天气怎么样？推荐附近的景点"

ReAct 循环:
1. Thought: 需要先获取北京的位置信息和天气
2. Action: get_location() → {"city": "北京市", "latitude": 39.9042, "longitude": 116.4074}
3. Observation: 当前位置是北京市
4. Thought: 根据位置查询天气和附近景点
5. Action: amap_maps_streamableHTTP_weather {"city": "北京"}
6. Observation: {"weather": "晴", "temp": 25}
7. Action: amap_maps_streamableHTTP_search_nearby {"type": "景点", "radius": 5000}
8. Observation: [{"name": "故宫", "distance": "2km"}, {"name": "天坛", "distance": "3km"}]
9. Final Answer: 北京今天晴天，25°C。附近景点推荐：故宫（2km）、天坛（3km）
```

### 任务 2: 附近餐厅推荐
```
用户: "帮我推荐附近的饭店，今天想吃辣的"

ReAct 循环:
1. Thought: 需要先获取当前位置
2. Action: get_location()
3. Observation: {"city": "北京市", "latitude": 39.9042, "longitude": 116.4074}
4. Thought: 根据位置搜索附近餐厅，筛选辣的
5. Action: amap_maps_streamableHTTP_search_nearby {"type": "餐饮", "radius": 3000}
6. Observation: [{"name": "川菜馆", "cuisine": "川"}, {"name": "粤菜馆", "cuisine": "粤"}, ...]
7. Final Answer: 推荐「川味坊」（距离1.2km，主打川菜麻辣口味）
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| MCP Server 连接超时 | 设置 10s 超时，超时后回退到仅本地工具 |
| MCP 工具 schema 不兼容 | 工具调用失败返回错误 Observation，不阻塞执行 |
| 并发请求 MCP 连接数过多 | 每次请求独立连接，请求结束自动关闭 |

## Migration Plan

1. **Phase 1**: 扩展 `src/lib/config.ts` 支持 MCP 配置读取
2. **Phase 2**: 创建 `src/app/react-agent/lib/local-tools.ts`
3. **Phase 3**: 扩展 `lib/tools.ts` 支持 MCP 工具格式
4. **Phase 4**: 修改 `api/execute/route.ts` 支持 MCP 工具调用
5. **Phase 5**: 更新 `ToolSelector.tsx` 分组显示工具
6. **Phase 6**: 测试验证

## Open Questions

1. ~~**MCP 工具名称冲突**~~ → 已解决：使用下划线前缀 `serverName_toolName` 避免冲突
2. **MCP 连接失败处理** → 超时后仅使用本地工具，继续执行
3. **地理位置精度** → 本地工具返回模拟数据，实际可扩展为浏览器 Geolocation API
