# Tool Call Module

## 学习目标

- 理解 Function Calling 机制
- 学会定义和注册工具
- 掌握多工具编排策略

## 模块布局

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

## 演示区布局

### Requirement: 左右分栏布局

系统应当在演示区采用左右分栏布局：左侧为对话区和工具列表，右侧为执行轨迹。

#### Scenario: 60/40 分栏

- **WHEN** 演示区渲染
- **THEN** 左侧占 60% 宽度（对话 + 工具），右侧占 40%（执行轨迹）

## 工具定义

### Requirement: get_time 工具

系统 SHALL 提供一个内置的 get_time 工具，支持获取指定时区的当前时间。

#### Scenario: get_time 工具 Schema

- **WHEN** API 接收请求
- **THEN** 工具定义为 OpenAI function calling 格式：
  - name: `get_time`
  - description: `获取指定时区的当前时间`
  - parameters: `{ timezone: string (IANA 时区), format: "full" | "date" | "time" }`

#### Scenario: timezone 参数

- **WHEN** timezone 参数为空
- **THEN** 默认使用 Asia/Shanghai

#### Scenario: format 参数

- **WHEN** format 为 full
- **THEN** 返回完整日期时间；为 date 仅返回日期；为 time 仅返回时间

## 消息交互

### Requirement: 消息发送与流式回复

系统 SHALL 支持用户输入消息并接收模型流式回复。

#### Scenario: 发送消息

- **WHEN** 用户输入「现在几点了？」并按 Enter
- **THEN** 消息发送到 API，模型开始流式响应

#### Scenario: 流式回复

- **WHEN** 模型产生文本片段
- **THEN** 回复内容以流式方式逐步显示在消息区

## 执行轨迹可视化

### Requirement: 动态事件流展示

系统 SHALL 在右侧面板实时展示每次 LLM 请求/响应、工具调用的完整执行轨迹，每个事件作为独立步骤动态追加。

#### Scenario: LLM Request 步骤

- **WHEN** 每轮 LLM 请求发送前
- **THEN** 右侧追加「Round N · LLM Request」步骤，显示 Request 按钮可查看完整 request body（含 messages + tools）

#### Scenario: LLM Response 步骤

- **WHEN** 每轮 LLM 响应结束
- **THEN** 右侧追加「Round N · LLM Response」步骤，显示 Response 按钮可查看 finish_reason、tool_calls、usage

#### Scenario: Tool Call 步骤

- **WHEN** 模型触发工具调用
- **THEN** 右侧追加「Tool Call: {toolName}」步骤，显示 JSON 格式的参数

#### Scenario: Tool Call Result 步骤

- **WHEN** 工具执行完成
- **THEN** 右侧追加「Tool Call Result: {toolName}」步骤，显示执行结果

#### Scenario: 多轮追踪

- **WHEN** 工具调用后进入下一轮 LLM 请求
- **THEN** 再次追加新的 LLM Request / LLM Response 步骤，形成完整链路

### Requirement: Request/Response 详情弹窗

用户点击 Request 或 Response 按钮时，系统 SHALL 弹出遮罩 Dialog 展示完整数据。

#### Scenario: Request 详情

- **WHEN** 用户点击 Request 按钮
- **THEN** Dialog 显示 JSON 格式的完整 request body（脱敏 API Key）

#### Scenario: Response 详情

- **WHEN** 用户点击 Response 按钮
- **THEN** Dialog 显示 finish_reason、tool_calls 列表、usage

## SSE 事件流

### Requirement: SSE 事件类型

API SHALL 通过 Server-Sent Events 推送以下事件类型：

| 事件类型 | 触发时机 | 字段 |
|---|---|---|
| `llm_request` | 每轮 LLM 请求发送前 | `round`, `request`（含 body） |
| `chunk` | 模型产生文本片段 | `delta` |
| `llm_response` | 每轮 LLM 响应结束 | `round`, `response`（含 finish_reason/tool_calls/usage） |
| `tool_call` | 模型决定调用工具 | `toolName`, `args` |
| `tool_result` | 工具执行完成 | `toolName`, `result` |
| `error` | 发生错误 | `error` |

#### Scenario: 完整事件序列（单轮工具调用）

```
llm_request → chunk (×N) → llm_response → tool_call → tool_result → [下一轮 llm_request → ...]
```

## LLM Client

### Requirement: 原生 Fetch 实现

系统 SHALL 使用原生 fetch 而非 AI SDK 实现 LLM 调用，以获取完整的 request/response 日志。

#### Scenario: 全局 llm-client

- **WHEN** API route 需要调用 LLM
- **THEN** 使用 `src/lib/llm-client.ts`（原生 fetch，支持 tools 参数）

#### Scenario: OpenAI Function Calling 格式

- **WHEN** 构建 request body
- **THEN** `tools` 字段格式为 `{ type: 'function', function: { name, description, parameters } }`

## 文档展示

### Requirement: 文档 Tab

系统 SHALL 在文档 Tab 中渲染 Markdown 格式的模块说明文档。

#### Scenario: 显示文档

- **WHEN** 用户切换到文档 Tab
- **THEN** 渲染 tool-call/docs/index.md 内容

#### Scenario: 文档不存在

- **WHEN** docs/index.md 不存在
- **THEN** 显示「暂无文档」

## 核心概念

| 概念 | 说明 |
|---|---|
| Function Calling | 模型通过 tool_calls 输出决定调用工具 |
| Agentic Loop | LLM → tool_call → tool_result → LLM → ... 的多轮循环 |
| SSE Streaming | 服务端推送事件，客户端实时更新 UI |
| OpenAI Function Calling | 通过 tools 参数声明可用工具，tool_calls 返回调用结果 |
