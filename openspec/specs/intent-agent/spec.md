# Intent Agent

## 学习目标

- 理解意图识别原理
- 学会槽位填充技术
- 掌握多意图处理策略
- 理解 LLM 流式输出与 thinking 内容渲染

## 页面布局

### Requirement: 左右分割布局

系统 SHALL 采用左右分割布局，左侧为交互区（意图标签 + 聊天），右侧为结果展示区。

#### Scenario: 布局比例

- **WHEN** 页面加载
- **THEN** 左侧占 50% 宽度，右侧占 50% 宽度

### Requirement: 页面顶部 Tab 切换

系统 SHALL 在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认选中「演示」Tab，展示意图识别演示区

#### Scenario: Tab 切换到文档

- **WHEN** 用户点击「文档」Tab
- **THEN** 页面切换到文档区，使用 DocsPanel 渲染学习文档

## 预定义意图标签

### Requirement: 意图标签展示

系统 SHALL 以标签流形式在页面上半部分展示预定义意图列表。

#### Scenario: 标签展示

- **WHEN** 演示区渲染
- **THEN** 以标签云形式展示所有预定义意图，每个标签显示意图中文标签

#### Scenario: 标签样式

- **WHEN** 展示意图标签
- **THEN** 每个标签采用圆角边框样式，hover 时显示背景色变化

### Requirement: 意图详情弹窗

系统 SHALL 在用户点击意图标签时弹出详情弹窗。

#### Scenario: 打开弹窗

- **WHEN** 用户点击意图标签
- **THEN** 弹出详情弹窗，显示意图 code 名称、中文标签、描述、槽位表格

#### Scenario: 关闭弹窗

- **WHEN** 用户点击关闭按钮或遮罩层
- **THEN** 弹窗关闭

#### Scenario: 槽位表格

- **WHEN** 意图详情弹窗展示槽位
- **THEN** 以表格形式展示：槽位名称、标签、类型、是否必填

## 聊天交互

### Requirement: 聊天消息时间线

系统 SHALL 在左侧下半部分以 MessageTimeline 组件展示聊天消息。

#### Scenario: 用户消息

- **WHEN** 渲染用户消息
- **THEN** 消息右对齐，显示 `[request]` 按钮可点击查看请求日志

#### Scenario: Assistant 消息

- **WHEN** 渲染 Assistant 消息
- **THEN** 消息左对齐，显示 `[response]` 按钮可点击查看响应日志

#### Scenario: 流式 thinking 内容

- **WHEN** LLM 推理过程中 streaming `reasoning_content`
- **THEN** 以内联方式实时展示 thinking 内容，使用浅紫色背景 + 💭 Thinking 标题 + 斜体文本样式

#### Scenario: 流式 content 内容

- **WHEN** LLM 输出 content 中
- **THEN** 以流式方式在 thinking 下方展示模型输出内容

#### Scenario: 消息空状态

- **WHEN** 消息列表为空且非流式
- **THEN** 显示引导提示「输入自然语言进行意图识别分析」

### Requirement: 输入面板

系统 SHALL 提供 InputPanel 组件处理用户输入。

#### Scenario: 发送消息

- **WHEN** 用户在输入框输入文本并按 Enter
- **THEN** 发送消息给 `/intent-agent/api/analyze`，输入框清空

#### Scenario: Enter 键发送

- **WHEN** 用户按下 Enter 键（非 Shift+Enter）
- **THEN** 等同于点击发送按钮

#### Scenario: 流式状态禁用

- **WHEN** 消息正在流式传输中
- **THEN** 输入框和发送按钮禁用

#### Scenario: 快捷示例

- **WHEN** InputPanel 渲染
- **THEN** 在输入框下方展示快捷示例标签，点击可填入示例文本

#### Scenario: 模型选择

- **WHEN** 可用模型数量大于 1
- **THEN** 显示模型下拉选择器

#### Scenario: 清空消息

- **WHEN** 用户点击清空按钮
- **THEN** 清空所有消息、请求日志和分析结果

### Requirement: 请求/响应日志弹窗

系统 SHALL 提供 LogDialog 弹窗展示请求和响应的完整日志。

#### Scenario: 查看请求日志

- **WHEN** 用户点击用户消息的 `[request]` 按钮
- **THEN** 弹出日志弹窗，显示请求的 URL、method、headers、body

#### Scenario: 查看响应日志

- **WHEN** 用户点击 Assistant 消息的 `[response]` 按钮
- **THEN** 弹出日志弹窗，显示响应的 content_delta、reasoning_delta 等事件

#### Scenario: 日志时间戳

- **WHEN** 日志弹窗展示日志条目
- **THEN** 每个条目显示时间戳，可选显示 duration

## 识别结果展示

### Requirement: 主意图识别结果

系统 SHALL 在右侧面板顶部展示识别到的主意图及其置信度。

#### Scenario: 显示主意图

- **WHEN** 意图分析完成
- **THEN** 展示主意图的 code 名称、中文标签和置信度进度条

#### Scenario: 置信度可视化

- **WHEN** 展示置信度
- **THEN** 以水平进度条 + 百分比形式，高（≥80%）绿色，中（60-79%）黄色，低（<60%）红色

### Requirement: 槽位提取结果

系统 SHALL 在右侧面板中间区域展示槽位提取结果。

#### Scenario: 显示槽位表格

- **WHEN** 意图分析完成且存在槽位
- **THEN** 展示槽位表格：槽位名称、提取值、归一化值

#### Scenario: 槽位归一化

- **WHEN** 槽位值可标准化（如「明天」→「2026-03-24」）
- **THEN** 在归一化列展示标准化后的值

#### Scenario: 无槽位

- **WHEN** 意图分析完成但无槽位
- **THEN** 显示「未提取到槽位信息」提示

### Requirement: 意图置信度排名

系统 SHALL 在右侧面板底部展示所有意图的置信度排名。

#### Scenario: 显示排名

- **WHEN** 意图分析完成
- **THEN** 按置信度降序展示所有预定义意图的置信度条

## 意图分析 API

### Requirement: POST `/intent-agent/api/analyze`

系统 SHALL 提供 SSE 流式 API 端点进行意图分析。

#### Scenario: 成功分析

- **WHEN** 收到合法分析请求
- **THEN** 调用 LLM 流式返回意图分析结果，SSE 事件包括：`request`、`reasoning_delta`、`content_delta`、`intent_result`、`done`

#### Scenario: enable_thinking

- **WHEN** 调用 LLM
- **THEN** 请求体携带 `enable_thinking: true` 和 `stream_options: { include_usage: true }`

#### Scenario: reasoning_content 流式

- **WHEN** LLM 输出 reasoning_content
- **THEN** 通过 SSE `reasoning_delta` 事件实时推送

#### Scenario: content 流式

- **WHEN** LLM 输出 content
- **THEN** 通过 SSE `content_delta` 事件实时推送

#### Scenario: 意图结果解析

- **WHEN** content 流结束
- **THEN** 从累积的 content 中解析 JSON 意图结果，发送 `intent_result` 事件

#### Scenario: 输入校验

- **WHEN** 请求中 text 字段为空
- **THEN** 返回 400 错误

#### Scenario: 模型未找到

- **WHEN** 请求中 model ID 不存在
- **THEN** 返回 400 错误

#### Scenario: LLM 调用失败

- **WHEN** LLM 调用出错
- **THEN** 返回 500 错误，通过 SSE `error` 事件推送错误信息

## 预定义意图数据

### Requirement: 内置意图

系统 SHALL 提供 5 个内置预定义意图：book_flight、book_hotel、query_weather、cancel_order、play_music。

#### Scenario: 意图结构

- **WHEN** 预定义意图渲染
- **THEN** 每个意图包含 name、label、description、slots 数组

#### Scenario: 槽位结构

- **WHEN** 槽位渲染
- **THEN** 每个槽位包含 name、label、type、required

## 核心概念

| 概念 | 说明 |
|---|---|
| Intent Classification | 将用户输入分类到预定义意图 |
| Slot Filling | 从输入中提取关键参数 |
| Multi-Intent | 一句话包含多个意图 |
| Intent Confidence | 意图识别的置信度 |
| reasoning_content | LLM 推理过程内容，通过 `enable_thinking: true` 启用 |
| SSE Streaming | Server-Sent Events 流式推送 |
