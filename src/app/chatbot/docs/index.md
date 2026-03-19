# Chatbot 基础

本模块介绍如何使用 LLM API 进行对话交互，包括 Messages 结构、模型参数、流式响应、简单的会话历史处理等核心概念。

## Messages 结构

Messages 是与 LLM 交互的核心数据结构。每条消息包含：

- **role**: 角色标识
  - `system`: 系统提示，指导模型行为
  - `user`: 用户消息
  - `assistant`: 模型回复
- **content**: 消息内容

### 示例

```json
[
  { "role": "system", "content": "你是一个有帮助的助手" },
  { "role": "user", "content": "什么是人工智能？" },
  { "role": "assistant", "content": "人工智能是..." }
]
```

## 模型参数


### Temperature

控制输出的随机性：(0.0 - 2.0)
- 值越低（接近 0）：输出更确定、更保守
- 值越高（接近 2）：输出更随机、更有创意
- 不同的Model有不通的限制；（Claude[0.0 - 1.0], GPT[0.0 - 2.0]）

### Max Tokens

限制模型输出的最大 token 数，防止生成过长内容。

### Stream（流式输出）

启用后，模型会边生成边返回内容，而不是等全部生成完毕再返回。

```javascript
// 流式Response
data: {\"choices\":[{\"delta\":{\"content\":\"\",\"role\":\"assistant\"},\"index\":0,\"logprobs\":null,\"finish_reason\":null}],\"object\":\"chat.completion.chunk\",\"usage\":null,\"created\":1773889407,\"system_fingerprint\":null,\"model\":\"qwen-max\",\"id\":\"chatcmpl-a2c73b51-3d10-9713-a343-9caf9e141a23\"}

data: {\"choices\":[{\"finish_reason\":null,\"logprobs\":null,\"delta\":{\"content\":\"Hello\"},\"index\":0}],\"object\":\"chat.completion.chunk\",\"usage\":null,\"created\":1773889407,\"system_fingerprint\":null,\"model\":\"qwen-max\",\"id\":\"chatcmpl-a2c73b51-3d10-9713-a343-9caf9e141a23\"}

data: {\"choices\":[{\"finish_reason\":\"stop\",\"delta\":{\"content\":\"\"},\"index\":0,\"logprobs\":null}],\"object\":\"chat.completion.chunk\",\"usage\":null,\"created\":1773889407,\"system_fingerprint\":null,\"model\":\"qwen-max\",\"id\":\"chatcmpl-a2c73b51-3d10-9713-a343-9caf9e141a23\"}

data: [DONE]
```

## HTTP 交互

### LLM Request

```http
POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "model": "qwen-max",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant" }
    { "role": "user", "content": "Hello" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": true
}
```

### LLM Response

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop",
      "index": 0,
      "logprobs": null
    }
  ],
  "object": "chat.completion",
  "usage": {
    "prompt_tokens": 29,
    "completion_tokens": 9,
    "total_tokens": 38,
    "prompt_tokens_details": {
      "cached_tokens": 0
    }
  },
  "created": 1773890093,
  "system_fingerprint": null,
  "model": "qwen-max",
  "id": "chatcmpl-7003a192-37f0-988e-8589-fcb50da5c805"
}
```

## 历史消息处理

初步使用简单的会话截断，防止上下文过大

- 滑动窗口：保留最近 N 条消息
- 超出限制时自动清理旧消息

