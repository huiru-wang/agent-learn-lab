# Proposal: Optimize Web Fonts

## Why

当前项目使用 Geist 字体（仅支持拉丁字符），完全不包含中文字形，导致页面上的中文内容回退到系统默认字体，显示效果差、阅读体验不佳。作为一个面向中文用户的 Agent 学习平台，良好的中英文排版体验至关重要。

## What Changes

- 引入优质中文字体（思源黑体 / Noto Sans CJK）作为衬线主体
- 引入优质英文字体栈，优化 web 端阅读体验（Inter、Geist 等）
- 通过 CSS @font-face + font-display: swap 实现字体加载优化，避免 FOIT
- 同时支持 light/dark 模式下的字体渲染特性
- 代码字体保持 Geist Mono

## Capabilities

### New Capabilities

- web-fonts: 配置中英文字体栈，支持自定义字体变量，适配 light/dark 模式

### Modified Capabilities

- (none)

## Impact

- src/app/globals.css - 新增字体变量和字体栈配置
- src/app/layout.tsx - 引入新的字体加载
- 无需新增依赖，使用 Google Fonts 或字体 CDN

