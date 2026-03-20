# Multi-Agent

## 学习目标

- 理解多 Agent 协作模式
- 学习任务分解和分配策略
- 掌握 Agent 通信和协调机制

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

系统 SHALL provide a text input for the multi-agent task.

#### Scenario: 输入任务

- **WHEN** 用户输入复杂任务（如分析代码并给出优化建议）
- **THEN** 显示任务描述

## 协作模式选择

### Requirement: Supervisor 模式

系统 SHALL support the Supervisor pattern where a master Agent assigns tasks to worker Agents.

#### Scenario: 选择 Supervisor 模式

- **WHEN** 用户选择 Supervisor 模式
- **THEN** 右侧可视化显示层级结构的 Agent 网络

### Requirement: Sequential 模式

系统 SHALL support sequential processing where Agents handle tasks one after another.

#### Scenario: 选择 Sequential 模式

- **WHEN** 用户选择 Sequential 模式
- **THEN** 右侧可视化显示线性处理流程

### Requirement: Debate 模式

系统 SHALL support multi-agent debate where Agents discuss and argue to reach a conclusion.

#### Scenario: 选择 Debate 模式

- **WHEN** 用户选择 Debate 模式
- **THEN** 右侧可视化显示多 Agent 对话辩论流程

## Agent 网络可视化

### Requirement: Agent 网络展示

系统 SHALL display the Agent network topology in the right panel.

#### Scenario: 显示网络拓扑

- **WHEN** 执行开始
- **THEN** 可视化展示 Agent 之间的连接关系

#### Scenario: Supervisor 拓扑

- **WHEN** Supervisor 模式
- **THEN** 显示一个 Supervisor Agent 连接多个 Worker Agent

#### Scenario: 网络拓扑

- **WHEN** Network 模式
- **THEN** 显示对等的 Agent 网络连接

### Requirement: Agent 状态展示

系统 SHALL display the real-time status of each Agent.

#### Scenario: 显示状态

- **WHEN** Agent 执行中
- **THEN** 显示 Agent 的当前状态（思考中、执行中、完成）

#### Scenario: 状态颜色

- **WHEN** Agent 状态改变
- **THEN** 使用不同颜色标识（蓝色=空闲、绿色=执行中、灰色=完成）

### Requirement: 结果合成展示

系统 SHALL display how sub-agent results are synthesized into the final answer.

#### Scenario: 显示合成过程

- **WHEN** 所有子 Agent 完成
- **THEN** 显示 Supervisor 或合成器整合结果的过程

## Agent 配置

### Requirement: Agent 选择

系统 SHALL display a list of available Agents for the user to select.

#### Scenario: 选择 Agents

- **WHEN** 演示区渲染
- **THEN** 显示可选的 Agent 列表（Security Agent、Performance Agent、Style Agent 等）

#### Scenario: 勾选 Agents

- **WHEN** 用户勾选/取消 Agent
- **THEN** 调整参与协作的 Agent 集合

### Requirement: 添加自定义 Agent

系统 SHALL support adding custom Agents with specific roles.

#### Scenario: 添加 Agent

- **WHEN** 用户点击「添加 Agent」
- **THEN** 配置 Agent 名称和职责描述

## 核心概念

| 模式 | 说明 |
|---|---|
| Supervisor | 主控 Agent 分配任务给工作 Agent |
| Sequential | Agent 按顺序依次处理 |
| Hierarchical | 层级结构的 Agent 组织 |
| Network | 对等的 Agent 网络 |
| Debate | 多 Agent 辩论得出结论 |
