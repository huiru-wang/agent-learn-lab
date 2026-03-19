# Design: Optimize Web Fonts

## Context

当前项目使用 Geist + Geist_Mono 字体，均仅支持拉丁字符（Latin subset）。项目面向中文用户，页面包含大量中文文档和 UI 文本，当前回退到系统默认中文字体（通常是宋体/微软雅黑），与整体设计语言不协调。

字体在 globals.css 中通过 `--font-sans` / `--font-mono` CSS 变量注入，layout.tsx 使用 next/font/google 加载。

## Goals / Non-Goals

**Goals:**
- 引入同时支持中英文的优质字体栈
- 英文字体保持现代感、清晰可读（适合代码/技术文档阅读）
- 中文字体选择：支持简体中文、显示效果好、兼顾 light/dark 模式
- 字体加载无 FOIT（Flash of Invisible Text），使用 font-display: swap
- 代码字体保持等宽特性

**Non-Goals:**
- 不引入花哨装饰字体
- 不做字体子集自定义（使用完整字重范围）
- 不改变现有 CSS 类名或布局结构

## Decisions

### 1. 中文字体选择：Noto Sans / Noto Serif SC

选择 Google Fonts 的 Noto Sans SC（无衬线）和 Noto Serif SC（衬线）作为中文首选：

**推荐方案 A（推荐）：**
- 英文：Geist + Inter 作为英文字体栈（Geist 现代感强，Inter 作为 fallback 覆盖更多字符）
- 中文：Noto Sans SC（正文/UI）、Noto Serif SC（文档正文/长文阅读）
- 方案：使用 `unicode-range` CSS 特性实现中英文混排，自动切换

**推荐方案 B（备选）：**
- 全部使用 Noto Sans SC + Geist 英文字母混排
- 更统一但英文字形可能偏常规

**方案 A 的理由：**
- Geist 是当前项目已使用的字体，用户已熟悉
- Noto Sans SC 是 Google 维护的高质量开源中文字体，字符覆盖完整
- `unicode-range` 可以让浏览器在下载字体时只加载需要的字符，减少字体包体积
- next/font 支持自动优化字体加载

### 2. 英文字体栈

英文字体栈（从最优到 fallback）：
```
Geist, Inter, "Noto Sans SC", "Source Han Sans CN", system-ui, sans-serif
```

- Geist：当前项目字体，保持现代技术感
- Inter：Google Fonts 优质无衬线字体，字符覆盖广，作为 Geist fallback
- Noto Sans SC：同时覆盖中文（作为中文字体主入口）
- Source Han Sans CN：Adobe/Google 开源中文无衬线字体，备选
- system-ui：操作系统默认字体，最可靠的 fallback
- sans-serif：通用无衬线兜底

### 3. 字体加载方式

使用 next/font/google 加载 Google Fonts（Noto Sans SC、Inter），配合 Tailwind CSS v4 的 `@theme` 变量注入。

```tsx
// layout.tsx
import { Geist, Geist_Mono, Inter, Noto_Sans_SC } from 'next/font/google';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansSC = Noto_Sans_SC({ subsets: ['latin', 'chinese-simplified'], variable: '--font-noto-sans-sc', weight: ['400', '500', '600', '700'] });
```

### 4. globals.css 字体变量

```css
@theme inline {
  --font-sans: var(--font-geist), var(--font-inter), var(--font-noto-sans-sc), system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, monospace;
}
```

### 5. 代码字体保持不变

代码展示使用 Geist Mono + react-syntax-highlighter 的主题，保持当前体验。

## Risks / Trade-offs

- [Risk] Google Fonts 在国内访问可能不稳定 → Mitigation: 使用 next/font 自动生成 local 字体资源，或使用国内 CDN（如字节跳动的 Bytefont）
- [Risk] Noto Sans SC 字重较多，可能影响加载性能 → Mitigation: 只加载 400/500/600/700 四个常用字重，使用 font-display: swap
- [Risk] 英文 + 中文混排时字体切换不自然 → Mitigation: 使用 `unicode-range` 让浏览器智能选择，或使用单一 Noto 字体覆盖全部字符
- [Trade-off] Inter vs Geist 英文字形风格差异 → 两者风格接近，Geist 作为主字体，Inter 仅作 fallback，影响极小

## Migration Plan

1. 更新 layout.tsx，添加 Inter 和 Noto Sans SC 字体加载
2. 更新 globals.css 的 @theme 字体变量配置
3. 验证 light/dark 模式下的字体渲染
4. 验证代码块（react-syntax-highlighter）的等宽字体显示
5. 在 DocsPanel 和 PromptDocsPanel 的 Markdown 渲染区域验证中英文混排效果

## Open Questions

- 是否需要考虑繁体中文支持（Noto Sans TC）？
- 是否需要引入衬线字体（Noto Serif SC）用于文档正文，提升阅读体验？
- 是否有必要添加字体加载进度指示器（可选）？

