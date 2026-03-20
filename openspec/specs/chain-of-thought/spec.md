# Chain of Thought

## 学习目标

- 理解思维链原理
- 学习思维树探索策略
- 掌握自我一致性技术

## UI 设计

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: 问题输入

系统应当在演示区左侧提供问题输入框。

#### Scenario: 输入问题

- **WHEN** 用户输入数学或推理问题
- **THEN** 显示问题内容

## 模式选择

### Requirement: CoT 模式选择

系统 SHALL provide a mode selector for different Chain of Thought strategies.

#### Scenario: Zero-shot CoT

- **WHEN** 用户选择 Zero-shot CoT
- **THEN** 系统使用「Let's think step by step」触发推理

#### Scenario: Tree of Thoughts

- **WHEN** 用户选择 Tree of Thoughts
- **THEN** 系统展示多路径探索和分支可视化

#### Scenario: Self-Consistency

- **WHEN** 用户选择 Self-Consistency
- **THEN** 系统进行多次采样并投票选择最终答案

### Requirement: 采样次数配置

系统 SHALL allow users to configure the number of samples for Self-Consistency.

#### Scenario: 设置采样次数

- **WHEN** 用户选择 Self-Consistency 模式
- **THEN** 显示采样次数选择器（5、10、20 次）

## 推理可视化

### Requirement: 推理步骤展示

系统 SHALL display the reasoning steps as a tree or linear structure.

#### Scenario: 线性推理展示

- **WHEN** Zero-shot CoT 执行
- **THEN** 以线性步骤展示推理过程（Step 1 → Step 2 → Step 3 → 答案）

#### Scenario: 树状推理展示

- **WHEN** Tree of Thoughts 执行
- **THEN** 以树状图展示多分支推理，每条路径用不同颜色

#### Scenario: 路径选择

- **WHEN** Tree of Thoughts 多条路径完成
- **THEN** 标注最优路径和最终选择的答案

### Requirement: 投票结果展示

系统 SHALL display voting results when using Self-Consistency.

#### Scenario: 显示投票统计

- **WHEN** 多次采样完成
- **THEN** 显示各答案的投票数和占比

#### Scenario: 最终答案

- **WHEN** 投票统计完成
- **THEN** 显示得票最多的答案作为最终答案

### Requirement: 答案展示

系统 SHALL display the final answer with the complete reasoning path.

#### Scenario: 显示答案

- **WHEN** 推理完成
- **THEN** 在底部显示最终答案

#### Scenario: 答案验证

- **WHEN** 答案显示
- **THEN** 显示正确答案供用户对比（如已知答案）

## 核心概念

| 概念 | 说明 |
|---|---|
| Zero-shot CoT | "Let's think step by step" |
| Manual CoT | 提供推理示例 |
| Tree of Thoughts | 多路径探索，选择最优解 |
| Self-Consistency | 多次采样，投票选择 |
