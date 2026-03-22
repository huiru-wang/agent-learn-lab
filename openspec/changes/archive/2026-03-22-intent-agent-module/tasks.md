## 1. 基础设施搭建

- [ ] 1.1 创建模块目录结构：`src/app/intent-agent/{components,lib,api/analyze,api/docs,docs}/`
- [ ] 1.2 创建预定义意图注册表 `lib/intent-registry.ts`，定义 IntentDef / SlotDef 接口和 5 个内置意图（book_flight、book_hotel、query_weather、cancel_order、play_music）
- [ ] 1.3 创建 Zustand Store `lib/store.ts`，包含 inputText、isAnalyzing、result、history 等状态和对应 actions

## 2. 后端 API 实现

- [ ] 2.1 创建意图分析 API `api/analyze/route.ts`：接收 text + model + intents，构造 System Prompt 让 LLM 输出 JSON 格式意图分析结果，解析返回
- [ ] 2.2 创建文档 API `api/docs/route.ts`：读取 `docs/index.md` 返回 Markdown 内容（参考 tool-call/api/docs/route.ts）

## 3. 前端组件实现

- [ ] 3.1 创建主页面 `page.tsx`：Tabs 演示/文档切换，复用 DocsPanel 渲染文档区
- [ ] 3.2 创建意图列表组件 `components/intent-list.tsx`：可折叠的预定义意图卡片列表
- [ ] 3.3 创建输入面板组件 `components/input-panel.tsx`：文本输入框、快捷示例按钮、分析按钮、模型选择、历史记录列表
- [ ] 3.4 创建结果面板组件 `components/result-panel.tsx`：主意图+置信度进度条、槽位表格（含归一化列）、全部意图排名、推理过程展示

## 4. 学习文档

- [ ] 4.1 编写 `docs/index.md` 学习文档：意图识别概述、意图分类原理、槽位填充技术、多意图处理、LLM 实现方法（System Prompt 设计）、与传统 NLU 的对比、最佳实践

## 5. 集成测试与验证

- [ ] 5.1 验证完整流程：输入文本 → 点击分析 → 右侧展示结果（主意图 + 置信度 + 槽位 + 排名 + 推理过程）
- [ ] 5.2 验证 Tab 切换、文档渲染、历史记录功能正常
- [ ] 5.3 验证错误处理：空输入提示、API 错误提示、JSON 解析容错
