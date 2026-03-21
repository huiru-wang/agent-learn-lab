# MCP 协议

## 概述

MCP（Model Context Protocol）是一种用于在 LLM 应用和外部数据源/工具之间建立连接的协议标准。

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

## 快速添加 MCP Server

### 前置准备

1. 准备一个支持 StreamableHTTP 传输模式的 MCP Server URL
2. 如果 Server 需要认证，准备好认证 Header（Bearer Token）

### 添加步骤

1. 进入「演示」Tab
2. 点击「添加 Server」
3. 填写 Server 配置：
   - **名称**：给 Server 起一个易记的名字
   - **URL**：MCP Server 的 StreamableHTTP endpoint（例如 `https://mcp.example.com/mcp`）
   - **认证 Header**（可选）：如果 Server 需要认证，填写 `Bearer your-token-here`
4. 点击「连接」
5. 连接成功后，左侧面板会显示该 Server 的 Tools、Resources、Prompts 数量

### 示例 Server

#### Nunjucks Server

Nunjucks 是一个模板引擎 MCP Server，可用于演示模板渲染能力：

- **URL**: 需自行部署或使用公共 Server
- **能力**: 模板渲染、资源读取

#### 高德地图 Server

高德地图 MCP Server 提供地理位置相关能力：

- **URL**: `https://mcp.amap.com/mcp?key=你的key`
- **能力**: 地理编码、路径规划、天气查询

> **注意**：以上示例需要你拥有对应的 API Key。将 Key 配置到 `models.config.json` 中，或在添加 Server 时通过认证 Header 传入。

## StreamableHTTP 传输模式

StreamableHTTP 是 MCP 协议的 HTTP 传输实现，使用双通道通信：

```
┌─────────────┐                           ┌──────────────────┐
│   Browser   │ ◄──── SSE (接收消息) ──── │  /api/mcp/sse    │
│  (Frontend) │                            │  MCP Client      │
│             │ ──── POST (发送请求) ────► │                  │
└─────────────┘                            └────────┬─────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │ Remote MCP Server │
                                            │ (StreamableHTTP)  │
                                            └──────────────────┘
```

### 请求流程

1. **建立连接**：`POST /api/mcp/connect` 创建 MCP Client session
2. **接收消息**：`GET /api/mcp/sse` 建立 SSE 连接，接收 Server 推送
3. **调用工具**：`POST /api/mcp/tools` 发送工具调用请求
4. **断开连接**：`POST /api/mcp/disconnect` 清理 session

## 三种 MCP 能力

### Tools（工具）

Tools 是 MCP Server 提供的可调用函数，LLM 可以通过 Tool Call 机制调用它们来执行特定任务。

**示例**：
- `get_time`: 获取指定时区的当前时间
- `amap_weather`: 查询某个城市的天气
- `nunjucks_render`: 渲染 Nunjucks 模板

### Resources（资源）

Resources 是 MCP Server 提供的只读数据，通过 URI 寻址访问。

**示例**：
- `file://config.json`: 读取配置文件
- `memory://recent`: 读取最近会话记录

### Prompts（提示词）

Prompts 是预定义的提示词模板，支持变量替换，方便复用复杂提示。

**示例**：
- `code_review`: 代码审查提示词模板，包含 `{language}`、`{code}` 等变量
- `translate`: 翻译提示词模板，包含 `{text}`、`{target_lang}` 等变量

## 消息格式

MCP 使用 JSON-RPC 2.0 格式：

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_time",
    "arguments": { "timezone": "Asia/Shanghai", "format": "full" }
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "2024-01-15 10:30:00 CST"
      }
    ]
  }
}
```
