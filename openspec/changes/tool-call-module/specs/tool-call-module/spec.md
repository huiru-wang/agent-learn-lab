# Tool Call Module

## ADDED Requirements

### Requirement: 页面顶部 Tab 切换

系统 SHALL 在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: 工具卡片展示

系统 SHALL 在演示区左侧顶部显示已启用的工具卡片列表。

#### Scenario: 显示 get_time 工具

- **WHEN** 演示区渲染
- **THEN** 显示 get_time 工具卡片，包含工具名称、描述、参数说明

#### Scenario: 工具卡片信息

- **WHEN** 工具卡片渲染
- **THEN** 展示：工具名（get_time）、描述（获取当前时间）、参数（timezone、format）

### Requirement: 消息交互

系统 SHALL 支持用户输入消息并接收模型回复。

#### Scenario: 发送消息

- **WHEN** 用户在输入框中输入「现在几点了？」并点击发送
- **THEN** 消息发送到 API，模型开始流式响应

#### Scenario: 流式回复

- **WHEN** 模型开始响应
- **THEN** 回复内容以流式方式逐步显示在消息区

### Requirement: 执行轨迹可视化

系统 SHALL 在右侧面板实时展示工具调用的 5 阶段执行轨迹。

#### Scenario: Step 1 - 用户输入

- **WHEN** 用户发送消息
- **THEN** 右侧面板 Step 1 显示用户输入内容

#### Scenario: Step 2 - 模型推理

- **WHEN** 模型开始推理
- **THEN** 右侧面板 Step 2 实时显示推理文本，识别到工具时高亮显示 tool_name 和参数

#### Scenario: Step 3 - 工具执行

- **WHEN** 模型触发工具调用
- **THEN** 右侧面板 Step 3 显示工具名称、构造的参数、执行状态、执行结果

#### Scenario: Step 4 - 结果注入

- **WHEN** 工具执行完成
- **THEN** 右侧面板 Step 4 显示 tool result 消息已追加到 messages 数组

#### Scenario: Step 5 - 最终回答

- **WHEN** 模型整合所有信息后完成回答
- **THEN** 右侧面板 Step 5 显示最终的完整回复文本

### Requirement: get_time 工具定义

系统 SHALL 提供符合 OpenAI function calling 规范的 get_time 工具定义。

#### Scenario: 工具 Schema

- **WHEN** API 接收请求
- **THEN** 工具定义为 JSON Schema：name=get_time、description=获取当前时间、parameters={ timezone: string, format: string }

#### Scenario: timezone 参数

- **WHEN** timezone 参数为空
- **THEN** 默认使用 Asia/Shanghai

#### Scenario: format 参数

- **WHEN** format 参数为空
- **THEN** 默认使用 full（完整日期时间）

### Requirement: get_time 工具执行

系统 SHALL 在服务端真实执行 get_time 工具。

#### Scenario: 执行返回结果

- **WHEN** 工具被调用
- **THEN** 返回 { timezone, date, time, full } 对象

#### Scenario: 时区转换

- **WHEN** timezone 为 America/New_York
- **THEN** 返回纽约时区的当前时间

#### Scenario: 格式控制

- **WHEN** format 为 date
- **THEN** 仅返回日期部分

### Requirement: SSE 流式响应

API SHALL 通过 Server-Sent Events 流式推送事件。

#### Scenario: chunk 事件

- **WHEN** 模型产生文本片段
- **THEN** SSE 推送 { type: 'chunk', delta: string }

#### Scenario: tool_call_start 事件

- **WHEN** 模型决定调用工具
- **THEN** SSE 推送 { type: 'tool_call_start', toolName, args }

#### Scenario: tool_result 事件

- **WHEN** 工具执行完成
- **THEN** SSE 推送 { type: 'tool_result', result }

#### Scenario: done 事件

- **WHEN** 模型完成最终回答
- **THEN** SSE 推送 { type: 'done', text, finishReason }

### Requirement: 文档展示

系统 SHALL 在文档 Tab 中渲染 Markdown 文档。

#### Scenario: 显示文档

- **WHEN** 用户切换到文档 Tab
- **THEN** 渲染 tool-call/docs/index.md 内容

#### Scenario: 文档不存在

- **WHEN** docs/index.md 不存在
- **THEN** 显示「暂无文档」
