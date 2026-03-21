# Tool Call（工具调用）

Tool Call 是让大语言模型（LLM）能够调用外部工具或函数的核心机制，也称为 **Function Calling**。通过工具调用，AI 可以突破纯文本生成的限制，与真实世界的 API、数据库和系统进行交互。

## 为什么需要 Tool Call？

LLM 本质上是一个文本预测模型，它的知识在训练时已经固定，无法：

- 获取实时信息（如当前时间、天气、股票价格）
- 执行计算（精确数学运算）
- 访问私有数据（用户的日历、企业数据库）
- 执行操作（发送邮件、创建订单）

Tool Call 通过让模型"声明意图"，由程序代码来实际执行，解决了这些限制。

## 工作原理

完整的工具调用流程分为 5 个阶段：

### Step 1: 用户输入
用户发送包含工具调用意图的消息，例如「现在纽约几点了？」。

### Step 2: 模型推理
模型分析用户意图，识别需要调用 `get_time` 工具。模型生成的不是普通文本，而是一个结构化的工具调用请求：

```json
{
  "tool_calls": [{
    "name": "get_time",
    "arguments": {
      "timezone": "America/New_York"
    }
  }]
}
```

### Step 3: 工具执行
服务端代码接收到工具调用请求，执行对应的函数，并获取结果：

```typescript
function executeGetTime(args: { timezone?: string; format?: string }) {
  const tz = args.timezone || 'Asia/Shanghai';
  const now = new Date();
  return now.toLocaleString('zh-CN', { timeZone: tz });
}
// 返回: "2026/3/20 22:30:45"
```

### Step 4: 结果注入
将工具执行结果作为新的消息追加到对话历史中，并重新发送给模型：

```json
{
  "role": "tool",
  "content": "2026/3/20 22:30:45"
}
```

### Step 5: 最终回答
模型基于工具返回的结果，生成自然语言回答：「纽约现在是 2026年3月20日 下午10点30分。」

## JSON Schema 定义

每个工具通过 JSON Schema 描述自身的能力和参数：

```typescript
const get_time = {
  name: 'get_time',
  description: '获取指定时区的当前时间',
  parameters: {
    type: 'object',
    properties: {
      timezone: {
        type: 'string',
        description: 'IANA 时区名称，如 Asia/Shanghai、America/New_York',
      },
      format: {
        type: 'string',
        enum: ['full', 'date', 'time'],
        description: '返回格式',
      },
    },
  },
};
```

清晰的描述（`description`）至关重要——模型依靠它来决定何时以及如何调用工具。

## Vercel AI SDK 实现

本演示使用 Vercel AI SDK 的 `streamText` + `tool()` 实现：

```typescript
import { streamText, tool } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: languageModel,
  messages,
  tools: {
    get_time: tool({
      description: '获取当前时间',
      parameters: z.object({
        timezone: z.string().optional(),
        format: z.enum(['full', 'date', 'time']).optional(),
      }),
      execute: async (args) => {
        return executeGetTime(args);
      },
    }),
  },
  maxSteps: 3, // 允许多轮工具调用
});
```

SDK 自动处理：工具调用检测、参数解析、结果注入和多轮对话管理。

## 关键概念

| 概念 | 说明 |
|------|------|
| Tool Definition | 工具的 JSON Schema 描述，告诉模型工具的用途和参数 |
| Tool Call | 模型生成的工具调用请求，包含工具名和参数 |
| Tool Result | 工具执行后的返回值，注入回对话历史 |
| maxSteps | 允许的最大工具调用轮次，防止无限循环 |
| Streaming | 流式传输，实时��到模型思考和工具调用过程 |

## 最佳实践

1. **精准的 description**：工具描述要清晰、具体，帮助模型准确判断调用时机
2. **严格的参数校验**：使用 Zod 或 JSON Schema 定义参数类型，防止非法输入
3. **错误处理**：工具执行可能失败，需要优雅降级
4. **设置 maxSteps**：防止模型进入无限工具调用循环
5. **安全考虑**：工具调用是服务端执行，注意权限控制和输入过滤
