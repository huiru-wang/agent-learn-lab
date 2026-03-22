## ADDED Requirements

### Requirement: 学习文档内容
系统 SHALL 提供完整的 Intent Agent 学习文档，涵盖意图识别的核心概念和技术原理。

#### Scenario: 文档结构
- **WHEN** 用户切换到「文档」Tab
- **THEN** 展示包含以下章节的 Markdown 文档：意图识别概述、为什么需要意图识别、意图分类原理、槽位填充技术、多意图处理、System Prompt 设计、最佳实践

### Requirement: 意图识别概述
文档 SHALL 解释意图识别（Intent Classification）的基本概念，包括什么是意图、意图在 Agent 中的作用。

#### Scenario: 概述内容
- **WHEN** 渲染文档
- **THEN** 包含意图识别的定义、在对话系统中的位置、与 NLU 的关系说明

### Requirement: 槽位填充文档
文档 SHALL 详细说明槽位填充（Slot Filling）技术，包括槽位定义、提取方法、归一化处理。

#### Scenario: 槽位填充内容
- **WHEN** 渲染文档
- **THEN** 包含：槽位的定义和类型、如何从用户输入中提取槽位、槽位归一化示例（日期、地点等）、必填/可选槽位处理

### Requirement: 多意图处理文档
文档 SHALL 说明如何处理用户输入中包含的多个意图。

#### Scenario: 多意图内容
- **WHEN** 渲染文档
- **THEN** 包含：多意图识别的挑战、优先级策略、实际示例

### Requirement: LLM 实现方法文档
文档 SHALL 说明如何使用 LLM Structured Output 实现意图识别，包括 System Prompt 设计要点。

#### Scenario: LLM 实现内容
- **WHEN** 渲染文档
- **THEN** 包含：System Prompt 设计模式、JSON Schema 约束输出、置信度评估方法、与传统 NLU 的对比

### Requirement: 文档 API
系统 SHALL 提供 GET `/intent-agent/api/docs` 端点，返回学习文档的 Markdown 内容。

#### Scenario: 成功获取文档
- **WHEN** 收到 GET 请求
- **THEN** 读取 `docs/index.md` 文件内容并返回
