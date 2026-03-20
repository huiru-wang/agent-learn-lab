# Intent Agent

## 学习目标

- 理解意图识别原理
- 学会槽位填充技术
- 掌握多意图处理策略

## UI 设计

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: 用户输入

系统应当在演示区左侧提供文本输入框，支持用户输入自然语言查询。

#### Scenario: 输入查询

- **WHEN** 用户在输入框中输入文本
- **THEN** 显示用户输入内容

#### Scenario: 触发分析

- **WHEN** 用户点击「分析意图」
- **THEN** 将输入发送给意图识别模型

## 识别结果展示

### Requirement: 主意图识别

系统 SHALL 在右侧面板展示识别到的主意图及其置信度。

#### Scenario: 显示主意图

- **WHEN** 意图分析完成
- **THEN** 显示识别的意图名称和置信度进度条

#### Scenario: 置信度可视化

- **WHEN** 显示置信度
- **THEN** 以进度条和百分比形式展示（0-100%）

### Requirement: 槽位提取

系统 SHALL display a table showing extracted slots from the user input.

#### Scenario: 显示槽位表

- **WHEN** 意图识别完成
- **THEN** 显示槽位名称和提取值的两列表格

#### Scenario: 槽位归一化

- **WHEN** 槽位值需要标准化（如日期）
- **THEN** 显示归一化后的值（如「明天」→「2024-01-15」）

### Requirement: 多意图处理

系统 SHALL 支持从一句话中识别多个意图。

#### Scenario: 多意图显示

- **WHEN** 用户输入包含多个意图
- **THEN** 显示所有识别到的意图及其优先级

## 预定义意图管理

### Requirement: 意图列表

系统 SHALL display a list of predefined intents that the model can recognize.

#### Scenario: 显示意图列表

- **WHEN** 演示区渲染
- **THEN** 显示预定义的意图列表（订机票、查天气、取消订单等）

#### Scenario: 添加自定义意图

- **WHEN** 用户点击「添加意图」
- **THEN** 打开意图编辑器，定义意图名称和槽位

### Requirement: 意图置信度

每个意图 SHALL display a confidence threshold indicator showing how certain the model is about each classification.

#### Scenario: 低置信度提示

- **WHEN** 意图置信度低于 60%
- **THEN** 显示黄色警告，建议用户确认

## 核心概念

| 概念 | 说明 |
|---|---|
| Intent Classification | 将用户输入分类到预定义意图 |
| Slot Filling | 从输入中提取关键参数 |
| Multi-Intent | 一句话包含多个意图 |
| Intent Confidence | 意图识别的置信度 |
