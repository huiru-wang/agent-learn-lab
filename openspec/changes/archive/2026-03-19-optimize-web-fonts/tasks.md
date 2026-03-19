# Tasks: Optimize Web Fonts

## 1. 字体加载配置

- [x] 1.1 在 layout.tsx 中导入 Inter 和 Noto_Sans_SC 字体（from next/font/google）
- [x] 1.2 配置 Noto Sans SC 字体变量 --font-noto-sans-sc，添加 400/500/600/700 字重
- [x] 1.3 将 Inter 和 Noto Sans SC 变量添加到 HTML body className

## 2. CSS 字体变量更新

- [x] 2.1 更新 globals.css 的 @theme inline 中的 --font-sans 变量，组合 Geist/Inter/Noto Sans SC/system-ui
- [x] 2.2 验证 --font-mono 保持 Geist Mono 配置不变

## 3. 验证与测试

- [x] 3.1 启动 dev server，验证首页中英文混排显示正常
- [x] 3.2 验证 dark 模式下字体渲染效果
- [x] 3.3 验证 DocsPanel 和 PromptDocsPanel 中 Markdown 文档的中文字体显示
- [x] 3.4 验证代码块等宽字体未受影响
- [x] 3.5 验证无 FOIT（字体加载闪烁）

