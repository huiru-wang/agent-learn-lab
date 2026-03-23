# ReAct Agent (推理 + 行动)

## 什么是 ReAct?

ReAct (Reasoning + Acting) 是一种让大型语言模型 (LLM) 能够动态推理并执行任务的架构模式。它通过 **Thought-Action-Observation** 的循环，让 Agent 能够在执行过程中不断思考、选择工具、观察结果，从而得出最终答案。

## 核心概念

### Thought (思考)
Agent 分析当前状态，决定下一步行动的过程。这个过程展示了模型的推理逻辑，让用户能够理解 Agent 为什么做出某个决定。

### Action (行动)
Agent 选择并调用工具来获取信息或执行操作。工具可以是：
- 查询天气 API
- 执行计算
- 搜索网络
- 访问数据库
- 等等...

### Observation (观察)
工具执行后返回的结果。Agent 会根据观察结果来更新自己的推理，并决定下一步行动。

### Loop (循环)
Thought → Action → Observation → Thought → ... 持续循环，直到 Agent 认为已经得到足够的信息来回答原始问题。

## ReAct vs 纯推理

| 纯推理 (Chain-of-Thought) | ReAct |
|---------------------------|-------|
| 模型自主推理 | 模型 + 外部工具 |
| 依赖模型知识 | 可获取实时信息 |
| 无法验证事实 | 可验证和纠正 |
| 适合数学/逻辑问题 | 适合需要信息的任务 |

## 示例流程

```
用户问题：北京明天天气怎么样？

Step 1:
💭 Thought: 用户想知道北京的天气，我需要调用天气 API 来获取信息。
🔧 Action: weather_api({"city": "北京"})
📤 Observation: {"city": "北京", "weather": "晴", "temperature": 25}

Step 2:
💭 Thought: 我已经获取到天气信息，北京明天是晴天，温度25度。
✓ Final Answer: 北京明天天气晴朗，温度约25摄氏度。
```

## 调试功能

### 单步执行
点击「单步」按钮，Agent 会执行一个完整的 Thought-Action-Observation 循环后暂停，让你可以仔细观察每一步的变化。

### 回放
执行完成后，可以点击「回放」重新观看整个推理过程，支持调节速度 (0.5x, 1x, 2x)。

## 工具颜色标识

| 工具 | 颜色 | 说明 |
|------|------|------|
| weather_api | 🔵 蓝色 | 查询城市天气 |
| calculator | 🟢 绿色 | 数学计算 |
| search | 🟠 橙色 | 网络搜索 |

## 参考资料

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Agent Learn Lab - Agent 基础架构](../)
