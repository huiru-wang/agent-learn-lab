## ADDED Requirements

### Requirement: 页面顶部 Tab 切换
系统 SHALL 在页面顶部显示「演示」和「文档」两个 Tab。

#### Scenario: 默认显示演示区
- **WHEN** 页面加载
- **THEN** 默认选中「演示」Tab，展示意图识别演示区

#### Scenario: Tab 切换到文档
- **WHEN** 用户点击「文档」Tab
- **THEN** 页面切换到文档区，使用 DocsPanel 渲染学习文档

### Requirement: 用户输入分析
系统 SHALL 在演示区左侧提供文本输入框，支持用户输入自然语言查询并触发意图分析。

#### Scenario: 输入文本并分析
- **WHEN** 用户在输入框中输入文本并点击「分析意图」按钮
- **THEN** 系统将输入发送给意图识别 API，右侧展示分析结果

#### Scenario: Enter 键触发分析
- **WHEN** 用户在输入框中按下 Enter 键（非 Shift+Enter）
- **THEN** 等同于点击「分析意图」按钮

#### Scenario: 分析中状态
- **WHEN** 意图分析正在进行中
- **THEN** 「分析意图」按钮显示加载状态，输入框禁用

#### Scenario: 快捷示例
- **WHEN** 演示区渲染
- **THEN** 在输入框下方展示 3-5 个快捷示例按钮（如「帮我订一张明天从北京到上海的机票」），点击可一键填入

### Requirement: 预定义意图列表展示
系统 SHALL 在左侧面板展示预定义的意图列表，帮助用户理解系统支持的意图类型。

#### Scenario: 显示意图列表
- **WHEN** 演示区渲染
- **THEN** 在输入框上方展示可折叠的预定义意图列表，包含每个意图的名称、中文标签和包含的槽位

#### Scenario: 意图卡片展示
- **WHEN** 展示意图列表
- **THEN** 每个意图以紧凑卡片形式展示，包含意图名称（如 `book_flight`）、中文标签（如「订机票」）和槽位列表

### Requirement: 主意图识别结果展示
系统 SHALL 在右侧面板展示识别到的主意图及其置信度。

#### Scenario: 显示主意图
- **WHEN** 意图分析完成
- **THEN** 在右侧面板顶部展示主意图名称、中文标签和置信度进度条

#### Scenario: 置信度可视化
- **WHEN** 展示置信度
- **THEN** 以水平进度条 + 百分比数字形式展示（0-100%），高置信度（≥80%）显示绿色，中等（60-79%）显示黄色，低（<60%）显示红色

### Requirement: 槽位提取结果展示
系统 SHALL 在右侧面板展示从用户输入中提取的槽位信息。

#### Scenario: 显示槽位表格
- **WHEN** 意图分析完成且存在槽位
- **THEN** 展示两到三列表格：槽位名称、提取值、归一化值（如有）

#### Scenario: 槽位归一化
- **WHEN** 槽位值可以标准化（如日期「明天」）
- **THEN** 在归一化列展示标准化后的值（如「2026-03-23」）

#### Scenario: 无槽位情况
- **WHEN** 意图分析完成但无槽位提取
- **THEN** 显示「未提取到槽位信息」的提示

### Requirement: 全部意图置信度排名
系统 SHALL 展示所有预定义意图的置信度排名列表。

#### Scenario: 显示全部意图排名
- **WHEN** 意图分析完成
- **THEN** 在槽位表格下方展示所有意图按置信度降序排列，每个意图显示名称和置信度百分比

### Requirement: 流式 thinking 展示
系统 SHALL 在聊天区域以流式方式展示 LLM 的 `reasoning_content` 内容。

#### Scenario: 流式 thinking
- **WHEN** LLM 推理过程中
- **THEN** 以内联方式实时展示 thinking 内容，使用浅紫色背景 + 💭 标题 + 斜体文本样式

#### Scenario: 流式 content
- **WHEN** LLM 输出内容中
- **THEN** 以流式方式在 thinking 下方展示模型输出内容

### Requirement: 分析历史记录
系统 SHALL 维护当前会话中的分析历史记录。

#### Scenario: 记录分析历史
- **WHEN** 每次意图分析完成
- **THEN** 将输入和结果添加到左侧底部的历史记录列表

#### Scenario: 点击历史记录
- **WHEN** 用户点击历史记录中的条目
- **THEN** 将该条目的分析结果展示在右侧面板

#### Scenario: 清空历史记录
- **WHEN** 用户点击「清空」按钮
- **THEN** 清空所有历史记录和当前结果

### Requirement: 意图分析 API
系统 SHALL 提供 POST `/intent-agent/api/analyze` 端点，接收用户输入文本和预定义意图列表，通过 LLM 返回结构化的意图分析结果。

#### Scenario: 成功分析
- **WHEN** 收到合法的分析请求
- **THEN** 调用 LLM 进行意图分析，返回 JSON 格式的结果（主意图、槽位、全部意图置信度、推理过程）

#### Scenario: 输入为空
- **WHEN** 请求中 text 字段为空
- **THEN** 返回 400 错误

#### Scenario: LLM 调用失败
- **WHEN** LLM 调用出错
- **THEN** 返回 500 错误，包含错误信息
