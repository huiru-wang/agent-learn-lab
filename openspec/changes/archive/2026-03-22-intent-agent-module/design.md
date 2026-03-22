## Context

Agent Learn Lab 的 Tool Call 和 MCP Protocol 模块已实现完整的演示+文档模式。Intent Agent 模块是 Phase 3 Agent 模块的首个，需要在 `/intent-agent` 路径下将当前的 stub 页面替换为完整的意图识别演示。

已有模式参考：
- **Tool Call 模块** (`src/app/tool-call/`): Tabs 演示/文档、Zustand Store、SSE 流式 API、执行轨迹可视化
- **MCP Protocol 模块** (`src/app/mcp-protocol/`): 类似架构，复用了 tool-call 的 trace-step 组件
- **共享组件**: `DocsPanel` (`src/app/chatbot/components/docs-panel.tsx`)、`llm-client.ts`、`config.ts`

**关键区别**：Intent Agent 不是对话式交互，而是「单次输入 → 结构化分析结果」的分析式交互。不需要 SSE 流式传输，一次性返回 JSON 结构化结果即可。

## Goals / Non-Goals

**Goals:**
- 实现意图识别演示，用户输入自然语言，展示分析结果（主意图、置信度、槽位、多意图）
- 通过 LLM Structured Output（JSON mode）实现意图分析后端 API
- 内置预定义意图列表（book_flight、book_hotel、query_weather、cancel_order、play_music），用户可查看但不可编辑（第一版）
- 右侧结果面板可视化展示意图识别全过程
- 完整的学习文档覆盖意图识别原理、槽位填充、多意图处理
- 保持与已有模块一致的 UI 风格和组件模式

**Non-Goals:**
- 不支持用户自定义添加意图（第一版）
- 不使用流式 SSE（分析结果一次性返回）
- 不实现对话式多轮追问（第一版仅支持单次分析）
- 不实现真正的 NLU 模型训练，使用 LLM 模拟意图识别

## Decisions

### 1. API 架构：非流式 POST + JSON Structured Output

与 Tool Call 模块的 SSE 流式不同，Intent Agent 的意图分析是一次性计算，使用普通 POST API 返回 JSON。

**API 端点**: `POST /intent-agent/api/analyze`

请求体：
```typescript
interface AnalyzeRequest {
  text: string;          // 用户输入文本
  model: string;         // 模型 ID
  intents: IntentDef[];  // 预定义意图列表
}
```

响应体：
```typescript
interface AnalyzeResponse {
  primaryIntent: {
    name: string;
    label: string;
    confidence: number;     // 0-1
  };
  slots: Array<{
    name: string;
    value: string;
    normalized?: string;    // 归一化值（如「明天」→「2026-03-23」）
  }>;
  allIntents: Array<{
    name: string;
    label: string;
    confidence: number;
  }>;
  reasoning: string;        // LLM 的推理过程
}
```

**实现方式**：使用 `chatCompletionStream` 的非流式模式（或直接使用 `chatCompletion`），通过 System Prompt 让 LLM 输出 JSON 格式的意图分析结果。Prompt 中嵌入预定义意图列表和槽位定义。

**优点**：简化前端状态管理，无需处理 SSE 事件流；JSON Structured Output 天然适合分类任务。

**替代方案**：使用 SSE 流式，实时展示推理过程。但意图识别通常耗时短（<2s），流式意义不大。

### 2. 前端状态：Zustand Store

```typescript
interface IntentAgentState {
  inputText: string;
  isAnalyzing: boolean;
  result: AnalyzeResponse | null;
  error: string | null;
  history: Array<{ input: string; result: AnalyzeResponse }>;
  // actions
  setInputText: (text: string) => void;
  analyze: (model: string) => Promise<void>;
  clearResult: () => void;
  clearHistory: () => void;
}
```

### 3. 预定义意图定义

内置 5 个意图，每个意图包含 name、label、description 和 slots 定义：

```typescript
interface IntentDef {
  name: string;            // e.g., 'book_flight'
  label: string;           // e.g., '订机票'
  description: string;     // 意图描述
  slots: SlotDef[];        // 槽位定义
}

interface SlotDef {
  name: string;            // e.g., 'origin'
  label: string;           // e.g., '出发地'
  type: 'string' | 'date' | 'number' | 'enum';
  required: boolean;
}
```

意图列表存储在 `src/app/intent-agent/lib/intent-registry.ts`。

### 4. 页面布局

```
┌────────────────────────────────────────────────────────────────┐
│ [演示] [文档]                                                    │
├─────────────────────────────┬──────────────────────────────────┤
│ 左侧 (50%): 输入区          │ 右侧 (50%): 分析结果             │
│                              │                                   │
│ [预定义意图列表 - 可折叠]   │ [空状态提示]                      │
│ • book_flight (订机票)       │                                   │
│ • book_hotel (订酒店)        │ 分析后显示：                      │
│ • query_weather (查天气)     │ ┌─────────────────────────────┐  │
│ • cancel_order (取消订单)    │ │ 🎯 主意图: book_flight      │  │
│ • play_music (播放音乐)      │ │ 置信度: ████████░░ 92%      │  │
│                              │ │                              │  │
│ ┌──────────────────────────┐│ │ 📋 槽位提取:                 │  │
│ │ 帮我订一张明天从北京到   ││ │ ┌──────┬───────┬────────┐   │  │
│ │ 上海的机票               ││ │ │ 槽位 │ 值    │ 归一化 │   │  │
│ └──────────────────────────┘│ │ ├──────┼───────┼────────┤   │  │
│                              │ │ │ origin│ 北京 │        │   │  │
│ [分析意图]  [清空]           │ │ │ dest  │ 上海 │        │   │  │
│                              │ │ │ date  │ 明天 │03-23   │   │  │
│ ─────────────────────────── │ │ └──────┴───────┴────────┘   │  │
│ 历史记录 (可折叠):           │ │                              │  │
│ • "查一下北京天气" → ...     │ │ 📊 全部意图排名:             │  │
│ • "帮我取消订单" → ...       │ │ 1. book_flight  92%          │  │
│                              │ │ 2. book_hotel   5%           │  │
│                              │ │ 3. query_weather 2%          │  │
│                              │ │                              │  │
│                              │ │ 💭 推理过程:                 │  │
│                              │ │ "用户提到了'订'、'机票'..."  │  │
│                              │ └─────────────────────────────┘  │
└─────────────────────────────┴──────────────────────────────────┘
```

### 5. System Prompt 设计

通过精心设计的 System Prompt，引导 LLM 输出结构化的意图分析结果：

```
你是一个意图识别系统。给定用户输入和预定义意图列表，你需要：
1. 识别用户的主意图
2. 提取相关槽位
3. 对所有预定义意图给出置信度评分
4. 如果槽位值可以归一化（如日期），提供归一化值

请以 JSON 格式返回结果...
```

### 6. 组件复用策略

| 组件 | 来源 |
|---|---|
| Tabs (演示/文档) | 复用 tool-call/page.tsx 的 Tab 模式 |
| DocsPanel | 复用 `src/app/chatbot/components/docs-panel.tsx` |
| Card / Badge / Button | 复用 shadcn/ui 组件 |
| Progress | 复用 shadcn/ui Progress 组件展示置信度 |

### 7. 文件结构

```
src/app/intent-agent/
├── page.tsx                    # 主页面（Tabs 演示/文档）
├── components/
│   ├── input-panel.tsx         # 左侧：输入框 + 快捷示例 + 历史记录
│   ├── result-panel.tsx        # 右侧：意图 + 置信度 + 槽位 + 推理
│   └── intent-list.tsx         # 预定义意图列表展示
├── lib/
│   ├── store.ts                # Zustand Store
│   └── intent-registry.ts     # 预定义意图定义
├── api/
│   ├── analyze/route.ts        # 意图分析 API
│   └── docs/route.ts           # 文档 API
└── docs/
    └── index.md                # 学习文档
```

## Risks / Trade-offs

- [Risk] LLM 输出 JSON 格式不稳定 → Mitigation：使用 JSON mode（如支持）或在 Prompt 中强调 JSON 格式要求；后端做 JSON 解析容错
- [Risk] 置信度评分主观性强，LLM 给出的分数可能不稳定 → Mitigation：仅作为演示目的，文档中说明这是模拟评分而非真实 NLU 系统
- [Trade-off] 不支持自定义意图 vs 支持 → 第一版简化，降低实现复杂度；后续可扩展
- [Trade-off] 非流式 vs 流式 → 意图分析通常很快，非流式更简单；如需要可后续改为流式
