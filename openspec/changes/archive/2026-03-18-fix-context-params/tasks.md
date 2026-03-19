## 1. Store 更新

- [x] 1.1 在 ModelParams 中保持 maxTokens (64-512)
- [x] 1.2 在 ChatState 中添加 contextMaxTokens，固定值 1024

## 2. 参数面板更新

- [x] 2.1 调整 maxTokens 滑块范围为 64-512

## 3. 上下文模块更新

- [x] 3.1 context-panel 显示独立的 contextMaxTokens = 1024
- [x] 3.2 显示当前 tokens 基于 contextMaxTokens 计算

## 4. 滑动窗口逻辑更新

- [x] 4.1 更新 applySlidingWindow 函数，使用 contextMaxTokens 计算触发阈值
- [x] 4.2 压缩后，被清理消息不计入上下文 tokens 数

## 5. 测试验证

- [x] 5.1 测试 maxTokens 参数传递到 API 请求
- [x] 5.2 测试滑动窗口基于 contextMaxTokens 触发
- [x] 5.3 测试压缩后 tokens 计算正确
