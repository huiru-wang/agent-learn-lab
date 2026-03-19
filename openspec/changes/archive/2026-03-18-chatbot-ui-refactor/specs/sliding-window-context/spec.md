## ADDED Requirements

### Requirement: 滑动窗口触发条件
系统应当在消息 token 总数超过 MaxTokens 的 60% 时触发滑动窗口压缩。

#### Scenario: 未触发压缩
- **WHEN** 当前 token 总数 <= MaxTokens × 60%
- **THEN** 不触发压缩，正常发送

#### Scenario: 触发压缩
- **WHEN** 当前 token 总数 > MaxTokens × 60%
- **THEN** 系统开始压缩，禁用发送，显示「压缩中...」

### Requirement: 滑动窗口保留逻辑
压缩时从最新消息开始删除，直到 token 总数小于 MaxTokens 的 40%。

#### Scenario: 压缩过程
- **WHEN** 触发压缩
- **THEN** 从最新消息开始逐条删除，直到 < MaxTokens × 40%

#### Scenario: 压缩完成
- **WHEN** token 总数 < MaxTokens × 40%
- **THEN** 压缩完成，恢复发送，界面更新

### Requirement: 已清理消息标记
被删除的消息应当标记为已清理，显示红色文字和「已清理」标签。

#### Scenario: 显示已清理消息
- **WHEN** 消息被滑动窗口清理
- **THEN** 消息显示为红色文字，前缀「已清理」标签

### Requirement: 上下文模块显示
系统应当在参数面板下方显示上下文模块，包含窗口状态和消息列表。

#### Scenario: 显示窗口状态
- **WHEN** 页面渲染上下文模块
- **THEN** 显示当前 token 使用情况和触发阈值

#### Scenario: 显示消息列表
- **WHEN** 上下文模块渲染
- **THEN** 显示消息列表，被清理的消息标记红色

### Requirement: 压缩中提示
压缩期间应当在上下文模块标题旁显示绿色「压缩中...」提示。

#### Scenario: 显示压缩提示
- **WHEN** 压缩进行中
- **THEN** 上下文模块标题旁显示绿色「压缩中...」
