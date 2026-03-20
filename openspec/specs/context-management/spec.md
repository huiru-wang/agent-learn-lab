# Context Management

## 学习目标

- 理解上下文管理的重要性
- 学习多种压缩和截断策略
- 掌握上下文优化技巧

## UI 设计

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: 对话历史展示

系统 SHALL display the conversation history with token counts.

#### Scenario: 显示对话列表

- **WHEN** 演示区渲染
- **THEN** 显示对话历史消息列表，每条标注 token 数

#### Scenario: 显示统计信息

- **WHEN** 对话历史展示
- **THEN** 显示当前消息总数和 token 总数

### Requirement: 模拟长对话

系统 SHALL provide a button to simulate a long conversation for testing.

#### Scenario: 模拟对话

- **WHEN** 用户点击「模拟长对话」
- **THEN** 自动生成多条模拟消息，观察上下文压缩效果

#### Scenario: 清空对话

- **WHEN** 用户点击「清空」
- **THEN** 重置对话历史

## 管理策略配置

### Requirement: 策略选择

系统 SHALL provide a dropdown to select different context management strategies.

#### Scenario: 选择滑动窗口

- **WHEN** 用户选择「滑动窗口」
- **THEN** 显示窗口大小配置

#### Scenario: 选择摘要压缩

- **WHEN** 用户选择「摘要压缩」
- **THEN** 显示摘要生成配置

#### Scenario: 选择 Token 预算

- **WHEN** 用户选择「Token 预算」
- **THEN** 显示 Token 上限配置

### Requirement: 窗口大小配置

系统 SHALL allow users to configure the sliding window size.

#### Scenario: 调整窗口大小

- **WHEN** 用户拖动窗口大小滑块
- **THEN** 实时显示当前窗口大小和 Token 预算

#### Scenario: 实时统计

- **WHEN** 窗口大小改变
- **THEN** 显示当前使用量 / 总量的进度条

## 压缩预览

### Requirement: 压缩效果预览

系统 SHALL display a preview of how the context would be compressed under the selected strategy.

#### Scenario: 滑动窗口预览

- **WHEN** 策略为滑动窗口
- **THEN** 预览哪些消息会被保留/删除（删除的显示灰色）

#### Scenario: 摘要预览

- **WHEN** 策略为摘要压缩
- **THEN** 预览压缩后的摘要内容

### Requirement: 对比效果

系统 SHALL 支持对比压缩前后的上下文差异。

#### Scenario: 对比按钮

- **WHEN** 用户点击「对比效果」
- **THEN** 分屏显示压缩前后的上下文内容

## 核心概念

| 策略 | 说明 | 优缺点 |
|---|---|---|
| Sliding Window | 保留最近 N 条消息 | 简单但可能丢失重要信息 |
| Summary | 压缩历史为摘要 | 保留语义但丢失细节 |
| Semantic Selection | 基于相关性选择 | 精准但计算成本高 |
| Token Budget | 按 Token 预算分配 | 灵活控制成本 |
