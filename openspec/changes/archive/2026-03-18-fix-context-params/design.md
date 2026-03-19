## Context

当前 chatbot 模块中 maxTokens 同时用于：
1. API 请求参数 max_tokens（限制单次输出）
2. 滑动窗口容量计算（触发压缩的阈值）

需要将这两个概念分离。

## Goals / Non-Goals

**Goals:**
- 分离 maxTokens 和 contextMaxTokens 两个独立参数
- maxTokens 用于 API 请求，范围 64-512
- contextMaxTokens 固定 1024，用于滑动窗口
- 压缩后，被清理消息不计入上下文 tokens 数

**Non-Goals:**
- 不修改其他模块的参数
- 不增加新的压缩策略

## Decisions

### 1. 参数分离

```
API 请求参数:
- maxTokens: 64-512 (用户可调) → max_tokens

滑动窗口参数:
- contextMaxTokens: 固定 1024 → 触发阈值计算
```

### 2. 压缩逻辑

```
压缩前:
- 当前上下文 tokens = 所有消息 token 总和
- 触发条件: > contextMaxTokens × 60% = 612

压缩后:
- 当前上下文 tokens = 剩余消息 token 总和
- contextMaxTokens 保持 1024
- 被清理的消息不再计入
```

### 3. 显示分离

参数面板显示:
- Max Tokens: 64-512 滑块

上下文模块显示:
- 窗口容量: 1024 (固定)
- 当前 tokens: 动态计算
- 触发阈值: 60%

## 实现细节

### store.ts
```typescript
interface ModelParams {
  maxTokens: number;      // 64-512，可调
  // ...
}

interface ChatState {
  contextMaxTokens: number;  // 固定 1024
  // ...
}
```

### 滑动窗口逻辑
```typescript
function applySlidingWindow(messages, maxTokens, contextMaxTokens) {
  const triggerThreshold = contextMaxTokens * 0.6;  // 612
  const targetThreshold = contextMaxTokens * 0.4;    // 409
  
  // 基于 contextMaxTokens 计算
  // 被清理后重新计算 tokens 时不包含已清理消息
}
```

### context-panel.tsx
- 显示 contextMaxTokens = 1024 (固定)
- 显示当前 tokens 使用情况
- 显示触发阈值 60%
