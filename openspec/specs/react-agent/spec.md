# ReAct Agent

## 学习目标

- 深入理解 ReAct (Reasoning + Acting) 模式
- 观察思考-行动-观察循环
- 学习 Agent 决策过程

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

- **WHEN** 用户输入任务描述
- **THEN** 显示任务内容

### Requirement: 可用工具选择

系统 SHALL display a list of available tools that the Agent can use during execution.

#### Scenario: 选择工具

- **WHEN** 演示区渲染
- **THEN** 显示可用工具列表（weather_api、calculator、search 等），支持勾选

#### Scenario: 工具状态

- **WHEN** 工具被勾选/取消
- **THEN** 启用/禁用该工具的调用能力

## 执行轨迹面板

### Requirement: 执行轨迹展示

系统 SHALL 在右侧面板以步骤为单位展示 Agent 的完整执行轨迹。

#### Scenario: 显示步骤列表

- **WHEN** 执行过程中
- **THEN** 实时更新步骤列表，每个步骤包含 Thought、Action、Observation

#### Scenario: 步骤详情

- **WHEN** 用户点击某个步骤
- **THEN** 展开显示完整的思考内容、工具调用参数、执行结果

### Requirement: 推理过程可视化

系统 SHALL display each Thought step with the agent's reasoning process.

#### Scenario: Thought 展示

- **WHEN** Agent 产生思考
- **THEN** 显示 Thought 标签及思考内容

#### Scenario: Action 展示

- **WHEN** Agent 选择工具
- **THEN** 显示 Action 标签及 tool name、arguments

#### Scenario: Observation 展示

- **WHEN** 工具执行完成
- **THEN** 显示 Observation 标签及返回结果

### Requirement: 最终答案展示

系统 SHALL display the final answer when the Agent completes the task.

#### Scenario: 显示最终答案

- **WHEN** Agent 执行完成
- **THEN** 在轨迹底部显示「Final Answer」及最终回答内容

## 调试控制

### Requirement: 单步执行

系统 SHALL support step-by-step execution, pausing after each Thought-Action-Observation cycle.

#### Scenario: 单步模式

- **WHEN** 用户点击「单步调试」
- **THEN** 执行一个完整步骤后暂停

#### Scenario: 继续执行

- **WHEN** 用户点击「继续」
- **THEN** 从当前步骤继续执行到下一个暂停点或结束

### Requirement: 轨迹回放

系统 SHALL 支持完整执行后回放整个决策过程。

#### Scenario: 回放控制

- **WHEN** 执行完成
- **THEN** 显示回放按钮，支持重播整个轨迹

### Requirement: 工具高亮

系统 SHALL use different colors to highlight different tools in the execution trace.

#### Scenario: 工具颜色区分

- **WHEN** 多个工具被调用
- **THEN** 每个工具使用不同的颜色标识，便于区分

## 核心概念

| 概念 | 说明 |
|---|---|
| Thought | Agent 的思考过程 |
| Action | 选择并执行工具 |
| Observation | 工具执行结果 |
| Loop | 循环直到得出最终答案 |
