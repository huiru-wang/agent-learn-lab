## ADDED Requirements

### Requirement: 多 Tab 文档展示
系统应当支持多个文档 Tab，点击切换显示不同文档内容。

#### Scenario: 显示 Tab 列表
- **WHEN** 组件渲染
- **THEN** 自动扫描 docs/ 目录，生成 Tab 列表

#### Scenario: Tab 切换
- **WHEN** 用户点击 Tab
- **THEN** 加载对应文档内容并显示

#### Scenario: Tab 名称生成
- **WHEN** 生成 Tab 列表
- **THEN** 从文件名提取名称：去掉序号和 .md 后缀

### Requirement: 文档扫描
系统应当自动扫描 docs/ 目录获取文档列表，最多加载 10 个文档。

#### Scenario: 扫描文档
- **WHEN** 组件挂载
- **THEN** 调用 API 获取文档列表，按文件名排序

#### Scenario: 文档数量限制
- **WHEN** 文档数量超过 10 个
- **THEN** 只显示前 10 个

### Requirement: Markdown 渲染
系统应当支持 Markdown 内容渲染，包括代码高亮。

#### Scenario: 渲染内容
- **WHEN** 文档加载完成
- **THEN** 渲染 Markdown 内容，代码块语法高亮

### Requirement: 目录导航
系统应当在右侧显示文档目录，支持点击跳转。

#### Scenario: 显示目录
- **WHEN** 文档加载完成
- **THEN** 提取 h1-h3 标题显示在右侧

#### Scenario: 目录跳转
- **WHEN** 用户点击目录项
- **THEN** 页面滚动到对应标题位置
