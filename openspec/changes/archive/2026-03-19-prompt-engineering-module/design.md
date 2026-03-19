## Context

项目需要一个展示 Prompt 技巧的模块，需要：
1. 展示多种 Prompt 类型（System Prompt、Few-shot、CoT、Chain of Thought）
2. 简单直接，无需复杂交互
3. 文档可维护性强

## Goals / Non-Goals

**Goals:**
- 多 Tab 文档展示，自动扫描目录
- 复用现有 DocsPanel 组件
- 支持 Markdown 渲染和代码高亮
- 右侧目录导航

**Non-Goals:**
- 不做交互式 Prompt 编辑
- 不做 Prompt 效果对比
- 不做文档编辑功能

## Decisions

### 1. 组件设计

复用 `DocsPanel` 组件，增加多 Tab 支持：

```typescript
interface PromptDocsPanelProps {
  modulePath: string;
  className?: string;
}
```

### 2. API 设计

```
GET /prompt-engineering/api/docs
Response: { docs: [{ name: string, title: string }] }

GET /prompt-engineering/api/docs/{name}
Response: Markdown 文件内容
```

### 3. 文档命名规范

```
01-system-prompt.md     → Tab: "System Prompt"
02-few-shot.md         → Tab: "Few-shot"
03-cot.md              → Tab: "CoT"
04-chain-of-thought.md  → Tab: "Chain of Thought"
```

文件名格式：`{序号}-{slug}.md`
- 序号用于排序（01, 02, 03...）
- slug 用于生成 Tab 名称（去掉序号和 .md）

### 4. Tab 生成逻辑

```typescript
// 1. 调用 /api/docs 获取文档列表
// 2. 按文件名排序
// 3. 取前 10 个
// 4. 生成 Tab: "01-system-prompt.md" → "System Prompt"
```

### 5. 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  [System Prompt] [Few-shot] [CoT] [Chain of Thought]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Markdown 内容                                              │
│                                                             │
│                                     [目录]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 技术实现

### API Routes

```
/api/docs/route.ts           - 获取文档列表
/api/docs/[name]/route.ts   - 获取单个文档
```

### 目录结构

```
src/app/prompt-engineering/
├── page.tsx
├── components/
│   └── prompt-docs-panel.tsx   # 复用的多 Tab 组件
├── api/
│   └── docs/
│       ├── route.ts             # GET /api/docs
│       └── [name]/route.ts       # GET /api/docs/{name}
└── docs/
    ├── 01-system-prompt.md
    ├── 02-few-shot.md
    ├── 03-cot.md
    └── 04-chain-of-thought.md
```

## 复用性

`PromptDocsPanel` 组件设计为通用组件，可复用于其他展示多文档的模块：
- 通过 `modulePath` 属性指定模块路径
- 自动扫描 docs/ 目录生成 Tab
