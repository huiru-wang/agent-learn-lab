## MODIFIED Requirements

### Requirement: 页面顶部 Tab 切换
系统应当在页面顶部显示「演示」和「文档」两个 Tab，默认显示演示区。

#### Scenario: Tab 切换
- **WHEN** 用户点击 Tab
- **THEN** 页面切换到对应区域

#### Scenario: 默认显示
- **WHEN** 页面加载
- **THEN** 默认显示演示区

### Requirement: 演示区左右布局
演示区应当分为聊天框和参数面板两部分，左右排列，比例为 2:1。

#### Scenario: 演示区布局
- **WHEN** 演示区渲染
- **THEN** 左侧为聊天框，右侧为参数面板，比例 2:1

#### Scenario: 可调宽度
- **WHEN** 用户拖拽分隔条
- **THEN** 聊天框和参数面板宽度调整，最小 30%

## ADDED Requirements

### Requirement: 参数面板保留参数
参数面板应当保留：模型选择、Temperature、Max Tokens、Stream 开关。

#### Scenario: 参数显示
- **WHEN** 参数面板渲染
- **THEN** 显示模型选择、Temperature、Max Tokens、Stream 开关

### Requirement: 移除 Top P 参数
参数面板应当移除 Top P 参数。

#### Scenario: 无 Top P
- **WHEN** 参数面板渲染
- **THEN** 不显示 Top P 参数
