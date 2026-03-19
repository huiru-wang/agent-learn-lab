## 1. 页面布局与 Tab 切换

- [x] 1.1 修改 page.tsx：添加顶部 Tab 组件（演示/文档）
- [x] 1.2 实现 Tab 状态切换逻辑
- [x] 1.3 定义演示区和文档区的容器结构

## 2. 演示区布局

- [x] 2.1 实现聊天框和参数面板左右布局（2:1 比例）
- [x] 2.2 添加可拖拽分隔条，最小宽度 30%
- [x] 2.3 确保聊天框自适应高度

## 3. 参数面板

- [x] 3.1 修改 param-controls.tsx：移除 Top P 参数
- [x] 3.2 调整 Max Tokens 范围：64-1024
- [x] 3.3 更新 store 中的参数默认值

## 4. 滑动窗口上下文

- [x] 4.1 实现滑动窗口逻辑函数 applySlidingWindow()
- [x] 4.2 触发条件：token > maxTokens × 60%
- [x] 4.3 保留逻辑：删除直到 < maxTokens × 40%
- [x] 4.4 添加 isPruned 消息标记
- [x] 4.5 压缩期间禁用发送，显示绿色「压缩中...」
- [x] 4.6 更新 context-panel.tsx：显示消息列表，红色标记已清理

## 5. 文档区与 DocsPanel

- [x] 5.1 创建文档目录 src/app/chatbot/docs/index.md
- [x] 5.2 创建文档加载 API (/chatbot/api/docs)
- [x] 5.3 创建 DocsPanel 组件（通用）
- [x] 5.4 实现 Markdown 渲染 + 代码高亮
- [x] 5.5 实现右侧目录（提取 h1-h3）
- [x] 5.6 实现目录点击跳转

## 6. 清理与集成

- [x] 6.1 移除 compression.ts 中不再需要的代码
- [x] 6.2 更新 TokenCounter 组件适配
- [x] 6.3 测试滑动窗口触发逻辑
- [x] 6.4 测试文档加载和目录跳转
- [x] 6.5 整体 UI 测试
