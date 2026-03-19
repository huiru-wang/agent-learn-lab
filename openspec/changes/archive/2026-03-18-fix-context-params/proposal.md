## Why

当前实现中 maxTokens 参数被同时用于 API 请求和滑动窗口容量计算，但实际上这两个概念应该区分：
- max_tokens 是 API 参数，限制单次模型输出的最大 token 数
- contextMaxTokens 是上下文窗口容量，用于滑动窗口触发计算

## What Changes

- **分离 maxTokens 参数**：maxTokens 专用于 API 请求的 max_tokens 参数，范围 64-512
- **新增 contextMaxTokens**：固定为 1024，用于滑动窗口容量计算
- **压缩逻辑修正**：被清理的消息不再计入当前上下文 tokens 数，但 contextMaxTokens 保持不变

## Capabilities

### New Capabilities
- `context-params`: 区分 maxTokens 和 contextMaxTokens 两个参数

### Modified Capabilities
- `sliding-window-context`: 更新滑动窗口逻辑，使用独立的 contextMaxTokens

## Impact

- **Affected Files**:
  - `src/app/chatbot/lib/store.ts` - 新增 contextMaxTokens 状态
  - `src/app/chatbot/components/param-controls.tsx` - 调整 maxTokens 参数范围
  - `src/app/chatbot/components/context-panel.tsx` - 显示独立的 contextMaxTokens
  - `src/app/chatbot/lib/chat.ts` - 更新滑动窗口逻辑
