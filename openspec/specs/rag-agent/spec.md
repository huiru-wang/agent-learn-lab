# RAG Agent

## 学习目标

- 理解 RAG (检索增强生成) 架构
- 学习文档处理和向量化流程
- 掌握检索和生成优化技巧

## UI 设计

### Requirement: 页面顶部 Tab 切换

系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换

- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示

- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: 知识库管理

系统 SHALL provide a document management interface for the knowledge base.

#### Scenario: 显示文档列表

- **WHEN** 演示区渲染
- **THEN** 显示已上传的文档列表

#### Scenario: 上传文档

- **WHEN** 用户点击「上传文档」
- **THEN** 支持上传 PDF、Markdown、Text 等格式

#### Scenario: 删除文档

- **WHEN** 用户删除某个文档
- **THEN** 从知识库中移除并重建索引

## 切分配置

### Requirement: Chunk Size 配置

系统 SHALL allow users to configure document chunk size for splitting.

#### Scenario: 设置 Chunk Size

- **WHEN** 用户调整 Chunk Size 滑块
- **THEN** 实时显示每个 chunk 的大致 token 数

### Requirement: Overlap 配置

系统 SHALL allow users to configure overlap between chunks.

#### Scenario: 设置 Overlap

- **WHEN** 用户调整 Overlap 滑块
- **THEN** 相邻 chunk 之间保持指定的 overlap

## RAG 流程可视化

### Requirement: 检索流程展示

系统 SHALL display the RAG pipeline visually in the right panel.

#### Scenario: 文档上传步骤

- **WHEN** 文档上传完成
- **THEN** 可视化面板显示「文档上传」步骤

#### Scenario: 文本切分步骤

- **WHEN** 切分配置完成
- **THEN** 显示「文本切分」步骤及 chunk 数量

#### Scenario: 向量化步骤

- **WHEN** chunks 正在向量化
- **THEN** 显示「向量化」步骤及 Embedding 模型

#### Scenario: 向量存储步骤

- **WHEN** 向量存储完成
- **THEN** 显示「向量存储」步骤及索引信息

### Requirement: 检索-生成流程

系统 SHALL display the query → retrieval → generation flow.

#### Scenario: 查询输入

- **WHEN** 用户输入查询
- **THEN** 可视化面板显示 Query 进入检索流程

#### Scenario: 检索结果

- **WHEN** 检索完成
- **THEN** 显示 top-k 个相关 chunk 及相似度分数

#### Scenario: 生成结果

- **WHEN** 生成完成
- **THEN** 显示最终回答内容

## 检索结果展示

### Requirement: 相关文档展示

系统 SHALL display the retrieved document chunks with similarity scores.

#### Scenario: 显示检索结果

- **WHEN** 检索完成
- **THEN** 按相关性排序显示 chunk 列表，每个包含来源和分数

#### Scenario: 显示来源

- **WHEN** 显示 chunk 内容
- **THEN** 标注来源文档名称

### Requirement: 检索阈值配置

系统 SHALL allow users to configure the similarity threshold for retrieval.

#### Scenario: 设置阈值

- **WHEN** 用户调整检索阈值
- **THEN** 只显示分数高于阈值的结果

## 核心概念

| 概念 | 说明 |
|---|---|
| Document Loading | 加载各种格式文档 |
| Text Splitting | 文档切分策略 |
| Embedding | 文本向量化 |
| Vector Store | 向量存储和索引 |
| Retrieval | 相似度检索 |
| Generation | 基于检索结果生成回答 |
