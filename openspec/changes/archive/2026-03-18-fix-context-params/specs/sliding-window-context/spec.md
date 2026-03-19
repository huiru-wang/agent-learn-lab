## MODIFIED Requirements

### Requirement: 滑动窗口使用独立 contextMaxTokens
滑动窗口容量计算使用独立的 contextMaxTokens 参数，固定为 1024，不再使用 maxTokens。

#### Scenario: 触发条件
- **WHEN** 当前上下文 tokens > contextMaxTokens × 60%
- **THEN** 触发滑动窗口压缩

#### Scenario: 保留逻辑
- **WHEN** 触发压缩
- **THEN** 从最新消息开始删除，直到 tokens < contextMaxTokens × 40%

### Requirement: 压缩后重新计算 tokens
压缩后，被清理的消息不再计入当前上下文 tokens 数，但 contextMaxTokens 保持 1024。

#### Scenario: 压缩后显示
- **WHEN** 压缩完成
- **THEN** 当前上下文 tokens = 剩余消息 token 总和

#### Scenario: 连续压缩
- **WHEN** 再次触发压缩
- **THEN** 基于剩余消息重新计算 tokens，与 contextMaxTokens 比较
