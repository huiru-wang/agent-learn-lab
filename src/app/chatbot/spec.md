# Chatbot

## UI 设计

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: 演示区左右布局

演示区应当分为聊天框和参数面板两部分，左右排列，比例为 2:1。

#### Scenario: 演示区布局

- **WHEN** 演示区渲染
- **THEN** 左侧为聊天框，右侧为参数面板，比例 2:1

### Requirement: 参数面板保留参数

参数面板应当保留：模型选择、Temperature、Max Tokens、Stream 开关。

#### Scenario: 参数显示

- **WHEN** 参数面板渲染
- **THEN** 显示模型选择、Temperature、Max Tokens、Stream 开关

### Requirement: 移除 Top P 参数

参数面板应当移除 Top P 参数。

#### Scenario: 无 Top P

- **WHEN** 参数面板渲染
- **THEN** 不显示 Top P 参数

## 业务逻辑

### Requirement: 分离 maxTokens 和 contextMaxTokens

系统应当区分 maxTokens 和 contextMaxTokens 两个独立参数。

#### Scenario: maxTokens 参数

- **WHEN** 参数面板渲染
- **THEN** 显示 maxTokens 滑块，范围 64-512，用于 API 请求

#### Scenario: contextMaxTokens 固定

- **WHEN** 上下文模块渲染
- **THEN** contextMaxTokens 固定显示 1024，不可调整

#### Scenario: maxTokens 用途

- **WHEN** 发送请求到 LLM API
- **THEN** 请求体中包含 max_tokens，值为 maxTokens 参数

### Requirement: 滑动窗口触发条件

系统应当在消息 token 总数超过 contextMaxTokens（固定 1024）的 60% 时触发滑动窗口压缩。

#### Scenario: 未触发压缩

- **WHEN** 当前 token 总数 <= contextMaxTokens × 60%（612 tokens）
- **THEN** 不触发压缩，正常发送

#### Scenario: 触发压缩

- **WHEN** 当前 token 总数 > contextMaxTokens × 60%
- **THEN** 系统开始压缩，禁用发送，显示「压缩中...」

### Requirement: 滑动窗口保留逻辑

压缩时从最新消息开始删除，直到 token 总数小于 contextMaxTokens 的 40%。

#### Scenario: 压缩过程

- **WHEN** 触发压缩
- **THEN** 从最新消息开始逐条删除，直到 < contextMaxTokens × 40%（410 tokens）

#### Scenario: 压缩后重新计算 tokens

- **WHEN** 压缩完成
- **THEN** 当前上下文 tokens = 剩余消息 token 总和，被清理的消息不再计入

#### Scenario: 连续压缩

- **WHEN** 再次触发压缩
- **THEN** 基于剩余消息重新计算 tokens，与 contextMaxTokens 比较

### Requirement: 已清理消息标记

被删除的消息应当标记为已清理，显示红色文字和「已清理」标签。

#### Scenario: 显示已清理消息

- **WHEN** 消息被滑动窗口清理
- **THEN** 消息显示为红色文字，前缀「已清理」标签

### Requirement: 压缩中提示

压缩期间应当在上下文模块标题旁显示绿色「压缩中...」提示。

#### Scenario: 显示压缩提示

- **WHEN** 压缩进行中
- **THEN** 上下文模块标题旁显示绿色「压缩中...」

## 文档设计

### Requirement: 文档区从 Markdown 文件加载内容

系统应当从模块目录下的 docs/index.md 加载 Markdown 文件，并渲染展示。

#### Scenario: 正常加载文档

- **WHEN** 用户切换到文档区
- **THEN** 系统加载并渲染 Markdown 内容

#### Scenario: 文档文件不存在

- **WHEN** docs/index.md 不存在
- **THEN** 系统显示空状态提示「暂无文档」

### Requirement: 文档区支持代码高亮

系统应当对文档中的代码块进行语法高亮显示。

#### Scenario: 渲染代码块

- **WHEN** 文档包含代码块
- **THEN** 系统根据代码语言进行语法高亮

### Requirement: 文档区右侧显示目录

系统应当自动提取 Markdown 中的 h1-h3 标题，显示在右侧目录区。

#### Scenario: 显示目录

- **WHEN** 文档渲染完成
- **THEN** 右侧显示提取的标题列表

#### Scenario: 点击目录跳转

- **WHEN** 用户点击目录中的标题
- **THEN** 页面滚动到对应标题位置

### Requirement: 目录固定在右侧

目录区应当固定在右侧，内容区滚动时目录保持可见。

#### Scenario: 目录固定

- **WHEN** 页面滚动
- **THEN** 目录区固定不动，内容区独立滚动

### Requirement: 文档区支持 Markdown 表格

文档区 SHALL 支持 GFM 表格渲染，包括表头、表体、单元格样式。

#### Scenario: 渲染 Markdown 表格

- **WHEN** 文档包含 Markdown 表格语法
- **THEN** 系统渲染为样式化的 HTML 表格

#### Scenario: 表格响应式

- **WHEN** 表格宽度超出容器
- **THEN** 表格可水平滚动
