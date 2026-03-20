# A2UI Protocol

## 学习目标

- 理解 Agent-to-UI 交互协议
- 学习动态 UI 生成技术
- 掌握结构化输出和交互组件

## UI 设计

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: 用户请求输入

系统 SHALL provide a text input for users to describe what UI they want the Agent to generate.

#### Scenario: 输入请求

- **WHEN** 用户输入自然语言请求（如「帮我创建一个用户注册表单」）
- **THEN** 显示请求内容

### Requirement: 触发生成

系统 SHALL provide a button to trigger the Agent to generate UI based on the request.

#### Scenario: 生成 UI

- **WHEN** 用户点击「生成 UI」
- **THEN** Agent 分析请求并生成对应的 UI Schema

## 动态 UI 渲染

### Requirement: UI 组件渲染

系统 SHALL render dynamic UI components based on the Agent's structured output.

#### Scenario: 渲染表单

- **WHEN** Agent 返回 form Schema
- **THEN** 渲染为可交互的 HTML 表单

#### Scenario: 渲染列表

- **WHEN** Agent 返回 list Schema
- **THEN** 渲染为可交互的列表组件

#### Scenario: 渲染卡片

- **WHEN** Agent 返回 card Schema
- **THEN** 渲染为卡片组件

### Requirement: 表单交互

系统 SHALL 支持动态生成的表单的完整交互。

#### Scenario: 表单输入

- **WHEN** 用户在生成的表单中输入
- **THEN** 表单状态实时更新

#### Scenario: 表单提交

- **WHEN** 用户点击提交按钮
- **THEN** 提交表单数据并显示结果

### Requirement: 渲染信息展示

系统 SHALL display metadata about the rendered UI.

#### Scenario: 显示 Schema 版本

- **WHEN** UI 渲染完成
- **THEN** 显示使用的 Schema 版本和类型

#### Scenario: 显示组件数量

- **WHEN** UI 渲染完成
- **THEN** 显示渲染的组件数量

## Schema 可视化

### Requirement: 生成 Schema 展示

系统 SHALL display the generated JSON Schema in the left panel.

#### Scenario: 显示 Schema

- **WHEN** UI 生成完成
- **THEN** 在左侧面板显示完整的 JSON Schema

#### Scenario: Schema 语法高亮

- **WHEN** 显示 Schema
- **THEN** 使用语法高亮增强可读性

### Requirement: Schema 编辑

系统 SHALL 支持在 Schema 可视化面板中直接编辑 JSON。

#### Scenario: 编辑 Schema

- **WHEN** 用户修改 JSON Schema
- **THEN** 右侧 UI 实时更新以反映更改

## Streaming UI

### Requirement: 流式 UI 更新

系统 SHALL support streaming updates to the UI as the Agent generates content.

#### Scenario: 流式渲染

- **WHEN** Agent 使用流式输出
- **THEN** UI 组件逐步渲染，无需等待完整响应

#### Scenario: 加载状态

- **WHEN** 部分内容加载中
- **THEN** 显示加载骨架屏或占位符

## 核心概念

| 概念 | 说明 |
|---|---|
| Structured Output | 结构化的 JSON 输出 |
| UI Components | 动态渲染的 UI 组件 |
| Interactive Forms | 动态生成的表单 |
| Streaming UI | 流式 UI 更新 |
