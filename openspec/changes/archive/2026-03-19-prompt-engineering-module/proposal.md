## Why

Prompt Engineering 是 LLM 应用开发的核心技能。当前项目需要展示各类 Prompt 技巧（System Prompt、Few-shot、CoT、Chain of Thought），帮助学习者理解不同 Prompt 策略的原理和效果。

## What Changes

- **新建 PromptDocsPanel 组件**：支持多 Tab 文档展示，基于现有 DocsPanel 扩展
- **文档扫描加载**：自动扫描 docs/ 目录，生成 Tab 列表，最多加载 10 个文档
- **文档命名规范**：文件名格式 `{序号}-{slug}.md`，Tab 名称从文件名提取
- **创建示例文档**：System Prompt、Few-shot、CoT、Chain of Thought

## Capabilities

### New Capabilities
- `prompt-docs-panel`: 多 Tab 文档展示组件，可复用于其他模块
- `docs-list-api`: 文档列表 API，支持获取目录下文档信息

## Impact

- **New Files**:
  - `src/app/prompt-engineering/page.tsx` - 页面入口
  - `src/app/prompt-engineering/components/prompt-docs-panel.tsx` - 多 Tab 文档组件
  - `src/app/prompt-engineering/api/docs/route.ts` - 文档列表 API
  - `src/app/prompt-engineering/api/docs/[name]/route.ts` - 单个文档 API
  - `src/app/prompt-engineering/docs/*.md` - 示例文档
