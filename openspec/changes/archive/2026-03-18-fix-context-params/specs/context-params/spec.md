## ADDED Requirements

### Requirement: 分离 maxTokens 和 contextMaxTokens
系统应当区分 maxTokens 和 contextMaxTokens 两个独立参数。

#### Scenario: maxTokens 参数
- **WHEN** 参数面板渲染
- **THEN** 显示 maxTokens 滑块，范围 64-512，用于 API 请求

#### Scenario: contextMaxTokens 固定
- **WHEN** 上下文模块渲染
- **THEN** contextMaxTokens 固定显示 1024，不可调整

### Requirement: maxTokens 用途
maxTokens 用于 API 请求的 max_tokens 参数，限制单次模型输出。

#### Scenario: API 请求
- **WHEN** 发送请求到 LLM API
- **THEN** 请求体中包含 max_tokens，值为 maxTokens 参数
