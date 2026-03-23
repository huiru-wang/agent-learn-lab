# ReAct Agent 实现规范

## ADDED Requirements

### Requirement: ReAct 执行引擎

系统 SHALL 实现 ReAct 执行引擎，通过 SSE 流式返回每个 Thought-Action-Observation 步骤。

#### Scenario: 执行启动

- **WHEN** 用户输入任务并点击执行
- **THEN** 发送请求到 `/react-agent/api/execute`，开始 SSE 流式接收步骤

#### Scenario: Thought 步骤流式

- **WHEN** LLM 产生思考内容
- **THEN** 通过 SSE `thought_delta` 事件实时推送

#### Scenario: Action 步骤

- **WHEN** LLM 选择工具
- **THEN** 通过 SSE `action` 事件推送工具名称和参数

#### Scenario: Observation 步骤

- **WHEN** 工具执行完成
- **THEN** 通过 SSE `observation` 事件推送执行结果

#### Scenario: 最终答案

- **WHEN** LLM 判定任务完成
- **THEN** 通过 SSE `final_answer` 事件推送最终答案

#### Scenario: 执行完成

- **WHEN** 所有步骤执行完毕
- **THEN** 发送 SSE `done` 事件，包含完整轨迹和 token 使用量

### Requirement: 模拟工具执行

系统 SHALL 实现模拟工具执行，用于演示目的。

#### Scenario: weather_api 调用

- **WHEN** Agent 执行 weather_api 工具
- **THEN** 返回模拟天气数据（如：北京，晴天，25°C）

#### Scenario: calculator 调用

- **WHEN** Agent 执行 calculator 工具
- **THEN** 返回计算结果

#### Scenario: search 调用

- **WHEN** Agent 执行 search 工具
- **THEN** 返回模拟搜索结果

### Requirement: 循环终止条件

系统 SHALL 在满足以下任一条件时终止执行：

- LLM 输出包含终止标记（如 "Final Answer:"）
- 达到最大迭代次数（默认 10 次）

#### Scenario: 正常终止

- **WHEN** LLM 输出包含最终答案
- **THEN** 终止执行，显示最终答案

#### Scenario: 超迭代限制

- **WHEN** 迭代次数达到 10 次
- **THEN** 强制终止，返回当前推理结果

### Requirement: 执行状态管理

系统 SHALL 管理执行状态：`idle` | `running` | `paused` | `done`

#### Scenario: 空闲状态

- **WHEN** 页面加载或执行完成后
- **THEN** 状态为 idle

#### Scenario: 运行状态

- **WHEN** 开始执行任务
- **THEN** 状态变为 running

#### Scenario: 暂停状态

- **WHEN** 单步执行一个步骤后
- **THEN** 状态变为 paused

#### Scenario: 完成状态

- **WHEN** 执行完成或达到终止条件
- **THEN** 状态变为 done

### Requirement: 调试控制

系统 SHALL 提供调试控制能力。

#### Scenario: 单步执行

- **WHEN** 用户点击「单步调试」
- **THEN** 执行一个完整步骤（Thought→Action→Observation）后暂停

#### Scenario: 继续执行

- **WHEN** 用户点击「继续」
- **THEN** 从当前步骤继续执行到结束或再次暂停

#### Scenario: 回放

- **WHEN** 执行完成后用户点击「回放」
- **THEN** 依次高亮展示每个步骤

### Requirement: 轨迹回放

系统 SHALL 支持完整执行后回放整个决策过程。

#### Scenario: 回放控制

- **WHEN** 执行完成
- **THEN** 显示回放按钮和进度条

#### Scenario: 回放高亮

- **WHEN** 回放中
- **THEN** 当前步骤高亮显示，延迟 1 秒后自动进入下一步

#### Scenario: 停止回放

- **WHEN** 用户点击「停止回放」
- **THEN** 回放终止，停留在当前步骤

## 核心概念

| 概念 | 说明 |
|---|---|
| Thought | Agent 的思考过程，推送 `thought_delta` 事件 |
| Action | 选择工具执行，推送 `action` 事件含 tool_name 和 arguments |
| Observation | 工具执行结果，推送 `observation` 事件含结果 |
| Final Answer | 最终答案，推送 `final_answer` 事件 |
| Loop | Thought→Action→Observation 循环直到得出答案 |

## 工具定义

### Requirement: 可用工具列表

系统 SHALL 提供三个模拟工具供 Agent 调用。

| 工具名 | 描述 | 颜色标识 |
|--------|------|----------|
| weather_api | 查询城市天气 | 蓝色 |
| calculator | 数学计算 | 绿色 |
| search | 网络搜索 | 橙色 |

#### Scenario: 工具选择

- **WHEN** 演示区渲染
- **THEN** 显示三个工具的复选框列表

#### Scenario: 工具启用状态

- **WHEN** 工具被勾选
- **THEN** 该工具可用于 Agent 执行

#### Scenario: 工具禁用状态

- **WHEN** 工具被取消勾选
- **THEN** Agent 不能选择该工具

## UI 交互

### Requirement: 输入验证

系统 SHALL 在执行前验证用户输入。

#### Scenario: 空输入禁用

- **WHEN** 用户未输入任务文本
- **THEN** 执行按钮和单步按钮禁用

#### Scenario: 空工具禁用

- **WHEN** 用户未选择任何工具
- **THEN** 执行按钮和单步按钮禁用

#### Scenario: 执行中禁用输入

- **WHEN** 执行过程中
- **THEN** 输入框禁用

### Requirement: 步骤展示

系统 SHALL 以折叠方式展示执行步骤。

#### Scenario: 折叠状态

- **WHEN** 步骤默认展示
- **THEN** 显示 Thought 首行摘要、Action 工具名、Observation 结果预览

#### Scenario: 展开状态

- **WHEN** 用户点击步骤
- **THEN** 展开显示完整内容（完整 Thought、完整参数 JSON、完整结果）

### Requirement: 错误处理

系统 SHALL 处理执行过程中的错误。

#### Scenario: LLM 输出解析失败

- **WHEN** LLM 输出格式无法解析
- **THEN** 返回错误 Observation，提示"LLM 输出解析失败"

#### Scenario: 工具执行异常

- **WHEN** 工具执行时抛出异常
- **THEN** 捕获异常，返回错误 Observation，Agent 继续推理

#### Scenario: SSE 连接断开

- **WHEN** 执行过程中 SSE 连接断开
- **THEN** 自动重试一次，失败则显示"连接失败，请检查网络后重试"

#### Scenario: 迭代超限

- **WHEN** 迭代次数达到 10 次
- **THEN** 强制终止，显示"执行已达最大迭代次数"

### Requirement: 回放速度

系统 SHALL 支持调节回放速度。

#### Scenario: 回放速度选项

- **WHEN** 回放中
- **THEN** 支持 0.5x、1x、2x 三种速度

#### Scenario: 回放默认速度

- **WHEN** 用户点击回放
- **THEN** 默认使用 1x 速度（每步 1 秒）

### Requirement: 重新执行

系统 SHALL 处理回放中重新执行的情况。

#### Scenario: 回放中重新执行

- **WHEN** 回放过程中用户点击执行或单步
- **THEN** 停止当前回放，清空轨迹，开始新执行
