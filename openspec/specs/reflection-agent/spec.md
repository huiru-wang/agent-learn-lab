# Reflection Agent

## 学习目标

- 理解反思机制原理
- 学习迭代改进策略
- 掌握自我评估技术

## UI 设计

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: 任务输入

系统应当在演示区左侧提供任务输入框。

#### Scenario: 输入任务

- **WHEN** 用户输入任务描述（如写一首诗、写一段代码）
- **THEN** 显示任务内容

### Requirement: 最大迭代配置

系统 SHALL allow users to configure the maximum number of iteration cycles.

#### Scenario: 设置最大迭代

- **WHEN** 用户选择最大迭代次数
- **THEN** Agent 在达到该次数后停止迭代

## 迭代历史面板

### Requirement: 迭代历史列表

系统 SHALL display a chronological list of all generation and reflection iterations.

#### Scenario: 显示迭代列表

- **WHEN** 迭代过程中
- **THEN** 右侧面板按顺序显示每次迭代的内容

#### Scenario: 迭代标签

- **WHEN** 每次迭代完成
- **THEN** 显示「迭代 N」标签

### Requirement: 生成内容展示

系统 SHALL display the generated content for each iteration.

#### Scenario: 显示生成内容

- **WHEN** 某次迭代完成
- **THEN** 在对应迭代项下显示生成的内容

### Requirement: 反思评估展示

系统 SHALL display the reflection/evaluation results for each iteration.

#### Scenario: 显示反思要点

- **WHEN** 反思完成
- **THEN** 显示反思评估的要点列表（如韵律不够工整、意象较为普通）

#### Scenario: 评估标注

- **WHEN** 反思要点标记通过/未通过
- **THEN** 通过的项显示绿色勾选，未通过的项显示黄色警告

### Requirement: 最终版本标识

系统 SHALL highlight the final refined version when the iteration ends.

#### Scenario: 最终版本标记

- **WHEN** 迭代结束（达到最大次数或满足收敛条件）
- **THEN** 标记最终的改进版本为「最终版本」

## 收敛判断

### Requirement: 自动收敛检测

系统 SHALL detect when the agent's output has converged (stopped improving significantly).

#### Scenario: 收敛判断

- **WHEN** 相邻两次迭代的改进幅度低于阈值
- **THEN** 标记为已收敛，提前结束迭代

#### Scenario: 显示收敛状态

- **WHEN** 达到收敛
- **THEN** 显示「已收敛」标签

## 核心概念

| 概念 | 说明 |
|---|---|
| Generation | 初始生成答案 |
| Reflection | 对答案进行批判性评估 |
| Improvement | 根据反思改进答案 |
| Iteration | 多轮迭代直到满意 |
