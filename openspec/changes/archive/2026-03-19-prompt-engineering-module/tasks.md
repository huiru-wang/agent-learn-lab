## 1. 目录结构创建

- [x] 1.1 创建 prompt-engineering/components/ 目录
- [x] 1.2 创建 prompt-engineering/api/docs/ 目录
- [x] 1.3 创建 prompt-engineering/docs/ 目录

## 2. API Routes

- [x] 2.1 创建 GET /api/docs - 获取文档列表
- [x] 2.2 创建 GET /api/docs/{name} - 获取单个文档内容

## 3. PromptDocsPanel 组件

- [x] 3.1 创建组件基础结构，多 Tab 支持
- [x] 3.2 实现文档列表加载和 Tab 生成
- [x] 3.3 实现 Markdown 渲染（复用 DocsPanel 逻辑）
- [x] 3.4 实现右侧目录导航

## 4. 示例文档

- [x] 4.1 创建 01-system-prompt.md
- [x] 4.2 创建 02-few-shot.md
- [x] 4.3 创建 03-cot.md
- [x] 4.4 创建 04-chain-of-thought.md

## 5. 页面集成

- [x] 5.1 更新 prompt-engineering/page.tsx
- [x] 5.2 集成 PromptDocsPanel 组件

## 6. 测试

- [x] 6.1 测试文档列表 API
- [x] 6.2 测试单个文档加载
- [x] 6.3 测试 Tab 切换
- [x] 6.4 测试目录导航
