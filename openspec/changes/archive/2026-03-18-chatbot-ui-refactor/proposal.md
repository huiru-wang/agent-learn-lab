## Why

Chatbot 模块作为 Agent 学习项目的入口，当前布局将聊天功能作为核心，且缺少文档展示区域。用户学习时需要「边学边练」，需要同时看到演示和文档。

## What Changes

- **顶部 Tab 切换**：页面顶部只保留「演示」和「文档」两个 Tab，默认显示演示区
- **演示区布局**：聊天框和参数面板左右排列，2:1 比例，可拖拽调整宽度，最小 30%
- **参数简化**：移除 Top P 参数，只保留模型、温度、最大 Token(1024)、流式开关
- **滑动窗口**：Token 超过 60% 阈值时触发压缩，保留消息直到 < 40%，超出直接丢弃并标记红色
- **上下文模块**：固定在参数面板下方，显示窗口状态和消息列表，压缩时显示绿色「压缩中...」
- **文档区**：固定加载 docs/index.md，右侧显示目录(h1-h3)，支持代码高亮
- **通用组件**：DocsPanel 设计为可复用组件，适用于所有模块

## Capabilities

### New Capabilities
- `docs-panel`: 文档区域组件，加载 Markdown 文件，右侧显示目录，支持代码高亮
- `sliding-window-context`: 滑动窗口上下文管理，token 阈值触发，自动丢弃并标记

### Modified Capabilities
- `chatbot-layout`: 顶部 Tab 切换 + 演示区左右布局(2:1)
- `chatbot-params`: 移除 Top P 参数

## Impact

- **Affected Files**:
  - `src/app/chatbot/page.tsx` - 添加 Tab 切换，重构布局
  - `src/app/chatbot/components/param-controls.tsx` - 移除 Top P
  - `src/app/chatbot/lib/store.ts` - 简化状态，添加窗口配置
  - `src/app/chatbot/lib/compression.ts` - 简化为滑动窗口
- **New Files**:
  - `src/app/chatbot/components/docs-panel.tsx` - 文档展示组件(通用)
  - `src/app/chatbot/docs/index.md` - 模块文档
  - `src/app/chatbot/api/docs/route.ts` - 文档加载 API
- **Removed**:
  - 页面标题栏
  - Top P 参数
  - 手动压缩按钮
  - 压缩模式选择
