# A2A Protocol

## 学习目标

- 理解 Agent-to-Agent 通信协议
- 学习消息格式和传输机制
- 掌握跨 Agent 协作模式

## UI 设计

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

## Agent 注册表

### Requirement: Agent 注册表

系统 SHALL display a registry of available Agents with their capabilities and status.

#### Scenario: 显示 Agent 列表

- **WHEN** 演示区渲染
- **THEN** 显示已注册的 Agent 卡片列表

#### Scenario: Agent 卡片内容

- **WHEN** 显示 Agent 卡片
- **THEN** 包含 Agent 名称、Skills 列表、在线状态

#### Scenario: 注册新 Agent

- **WHEN** 用户点击「注册新 Agent」
- **THEN** 打开 Agent 注册表单

### Requirement: Agent 在线状态

系统 SHALL display the online/offline status of each Agent.

#### Scenario: 在线状态

- **WHEN** Agent 可用
- **THEN** 显示绿色「在线」指示器

#### Scenario: 离线状态

- **WHEN** Agent 不可用
- **THEN** 显示灰色「离线」指示器

## 通信监控

### Requirement: 消息日志

系统 SHALL display a real-time log of inter-Agent messages.

#### Scenario: 显示消息列表

- **WHEN** 消息发送/接收
- **THEN** 在消息日志中新增条目

#### Scenario: 消息详情

- **WHEN** 显示消息条目
- **THEN** 包含 From、To、Type、时间戳

### Requirement: 消息类型展示

系统 SHALL support displaying different message types in the log.

#### Scenario: task-request 消息

- **WHEN** 发送任务请求
- **THEN** 消息类型显示为 task-request

#### Scenario: subtask 消息

- **WHEN** 分配子任务
- **THEN** 消息类型显示为 subtask

#### Scenario: result 消息

- **WHEN** 返回结果
- **THEN** 消息类型显示为 result

### Requirement: 查看消息详情

系统 SHALL support viewing the full JSON payload of any message.

#### Scenario: 展开详情

- **WHEN** 用户点击消息条目
- **THEN** 展开显示完整的消息 JSON 内容

### Requirement: 导出日志

系统 SHALL 支持导出通信日志。

#### Scenario: 导出日志

- **WHEN** 用户点击「导出日志」
- **THEN** 下载 JSON 格式的完整通信记录

## 任务协作

### Requirement: 发起协作任务

系统 SHALL provide an interface to initiate multi-Agent collaboration tasks.

#### Scenario: 输入任务

- **WHEN** 用户在任务输入框中输入任务描述
- **THEN** 显示任务内容

#### Scenario: 发送任务

- **WHEN** 用户点击「发送任务」
- **THEN** 将任务分发给相关 Agent 并启动协作

## 核心概念

| 概念 | 说明 |
|---|---|
| Agent Card | Agent 身份和能力声明 |
| Message Format | 标准化的消息结构 |
| Task Lifecycle | 任务状态机管理 |
| Communication | 同步/异步通信模式 |
