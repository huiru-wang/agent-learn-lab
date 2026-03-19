## ADDED Requirements

### Requirement: 文档区从 Markdown 文件加载内容
系统应当从模块目录下的 docs/index.md 加载 Markdown 文件，并渲染展示。

#### Scenario: 正常加载文档
- **WHEN** 用户切换到文档区
- **THEN** 系统加载并渲染 Markdown 内容

#### Scenario: 文档文件不存在
- **WHEN** docs/index.md 不存在
- **THEN** 系统显示空状态提示「暂无文档」

### Requirement: 文档区支持代码高亮
系统应当对文档中的代码块进行语法高亮显示。

#### Scenario: 渲染代码块
- **WHEN** 文档包含代码块
- **THEN** 系统根据代码语言进行语法高亮

### Requirement: 文档区右侧显示目录
系统应当自动提取 Markdown 中的 h1-h3 标题，显示在右侧目录区。

#### Scenario: 显示目录
- **WHEN** 文档渲染完成
- **THEN** 右侧显示提取的标题列表

#### Scenario: 点击目录跳转
- **WHEN** 用户点击目录中的标题
- **THEN** 页面滚动到对应标题位置

### Requirement: 目录固定在右侧
目录区应当固定在右侧，内容区滚动时目录保持可见。

#### Scenario: 目录固定
- **WHEN** 页面滚动
- **THEN** 目录区固定不动，内容区独立滚动
