# MCP Protocol

## 学习目标

- 理解 Model Context Protocol 架构
- 学会连接和使用 MCP Server
- 掌握资源、工具、提示词的使用

## UI 设计

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: MCP Server 连接管理

系统应当在演示区顶部显示已连接的 MCP Server 列表，支持连接新服务器。

#### Scenario: 显示已连接服务器

- **WHEN** 演示区渲染
- **THEN** 显示已连接的 MCP Server 列表（文件系统、GitHub、数据库等）

#### Scenario: 连接新服务器

- **WHEN** 用户点击「连接新服务器」
- **THEN** 显示连接配置表单（Server URL、认证信息）

#### Scenario: 连接状态

- **WHEN** 服务器连接成功/失败
- **THEN** 显示绿色「已连接」或红色「连接失败」状态

## Server 资源浏览器

### Requirement: Resources 浏览器

系统应当在左侧面板展示 MCP Server 提供的 Resources（可读取的数据源）。

#### Scenario: 显示 Resources 列表

- **WHEN** MCP Server 连接成功
- **WHEN** 系统 SHALL display a tree structure of available Resources (files, database tables, etc.)

#### Scenario: 读取 Resource

- **WHEN** 用户点击 Resource
- **THEN** 在右侧面板显示 Resource 内容

### Requirement: Tools 浏览器

系统 SHALL display MCP Server 提供的 Tools 列表。

#### Scenario: 显示 Tools 列表

- **WHEN** MCP Server 连接成功
- **THEN** 显示可调用的工具列表（read_file、write_file、list_directory 等）

#### Scenario: 调用 Tool

- **WHEN** 用户选择工具并填写参数
- **THEN** 调用 MCP Server 的 tool 并显示结果

### Requirement: Prompts 浏览器

系统 SHALL display MCP Server 提供的预定义提示词模板。

#### Scenario: 显示 Prompts 列表

- **WHEN** MCP Server 连接成功
- **THEN** 显示预定义的提示词模板列表

#### Scenario: 使用 Prompt

- **WHEN** 用户点击 Prompt 模板
- **THEN** 填充模板变量并在交互面板中使用

## 交互面板

### Requirement: 交互执行

系统应当在右侧面板提供交互执行区域，支持调用已连接的 MCP 资源。

#### Scenario: 执行操作

- **WHEN** 用户选择工具/资源并填写参数后点击「执行」
- **THEN** 发送请求到 MCP Server 并显示结果

### Requirement: 查看调用详情

系统 SHALL 提供「查看调用详情」按钮，展示完整的请求/响应内容。

#### Scenario: 显示详情

- **WHEN** 用户点击「查看调用详情」
- **THEN** 展开 JSON 格式的请求体和响应体

## 核心概念

| 概念 | 说明 |
|---|---|
| MCP Server | 提供资源、工具、提示词的服务端 |
| Resources | 可读取的数据源（文件、数据库等） |
| Tools | 可调用的函数 |
| Prompts | 预定义的提示词模板 |
| Sampling | Server 请求 LLM 生成内容 |
