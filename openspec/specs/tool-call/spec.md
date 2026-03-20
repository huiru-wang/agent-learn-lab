# Tool Call

## 学习目标

- 理解 Function Calling 机制
- 学会定义和注册工具
- 掌握多工具编排策略

## UI 设计

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: 可用工具列表

系统应当在演示区顶部显示可用工具列表，支持勾选启用/禁用，并支持添加工具。

#### Scenario: 显示工具列表

- **WHEN** 演示区渲染
- **THEN** 显示已配置的工具列表（天气查询、计算器、搜索等）

#### Scenario: 添加工具

- **WHEN** 用户点击「添加工具」
- **THEN** 打开工具定义编辑器

#### Scenario: 启用/禁用工具

- **WHEN** 用户勾选/取消勾选工具
- **THEN** 该工具在后续调用中启用/禁用

## 工具定义编辑器

### Requirement: JSON Schema 编辑器

系统应当提供 JSON Schema 编辑器，允许用户定义工具的 name、description、parameters。

#### Scenario: 编辑工具定义

- **WHEN** 用户在编辑器中输入 JSON Schema
- **WHEN** 系统 SHALL validate the JSON structure and display validation errors inline

#### Scenario: 实时验证

- **WHEN** JSON Schema 格式错误
- **THEN** 显示红色错误提示，说明错误位置

### Requirement: 工具参数编辑

系统应当支持编辑工具的输入参数，包括类型定义和描述。

#### Scenario: 定义参数

- **WHEN** 用户在 parameters 中定义字段
- **THEN** 支持 type: string、number、boolean、object、array 等类型

### Requirement: 验证工具定义

系统应当提供「验证定义」按钮，检查 JSON Schema 是否符合 OpenAI function calling 规范。

#### Scenario: 验证通过

- **WHEN** JSON Schema 格式正确
- **THEN** 显示绿色「验证通过」提示

#### Scenario: 验证失败

- **WHEN** JSON Schema 格式错误
- **THEN** 显示具体错误信息

### Requirement: 测试调用

系统应当提供「测试调用」按钮，使用用户定义的工具进行实际调用测试。

#### Scenario: 触发测试

- **WHEN** 用户点击「测试调用」
- **THEN** 发送测试请求，观察模型如何调用工具

## 调用流程可视化

### Requirement: 可视化调用链

系统应当在右侧面板可视化展示工具调用的完整流程。

#### Scenario: 显示调用流程

- **WHEN** 工具调用发生
- **THEN** 右侧面板展示：User Input → LLM Reasoning → Tool Selection → Tool Execution → Result → LLM Response

#### Scenario: 动画展示

- **WHEN** 调用流程执行
- **THEN** 每个步骤以动画方式依次展示

### Requirement: 调用详情展示

系统应当展示每次调用的详细参数和返回结果。

#### Scenario: 显示调用参数

- **WHEN** 工具被调用
- **THEN** 显示 tool name、arguments JSON、execution result

#### Scenario: 显示模型推理

- **WHEN** 模型决定调用工具
- **THEN** 展示模型的思考过程和选择理由

## 业务逻辑

### Requirement: 多工具编排

系统 SHALL 支持一次请求调用多个工具，展示并行调用和顺序调用策略。

#### Scenario: 并行调用

- **WHEN** 用户输入涉及多个工具
- **THEN** 模型可同时调用多个工具

#### Scenario: 顺序调用

- **WHEN** 工具 B 依赖工具 A 的结果
- **THEN** 模型按依赖顺序依次调用

### Requirement: 工具执行

系统 SHALL 通过 Tool 定义中的 execute 函数执行工具调用，并返回结果。

#### Scenario: 执行工具

- **WHEN** 模型选择并调用工具
- **THEN** 执行对应函数，返回结果给模型

#### Scenario: 工具执行错误

- **WHEN** 工具执行抛出异常
- **THEN** 返回错误信息给模型，模型尝试修复或给出错误回答

## 核心概念

| 概念 | 说明 |
|---|---|
| Tool Definition | JSON Schema 定义工具参数 |
| Tool Selection | 模型自动选择合适的工具 |
| Parallel Calling | 一次请求调用多个工具 |
| Tool Result | 工具执行结果返回给模型 |
