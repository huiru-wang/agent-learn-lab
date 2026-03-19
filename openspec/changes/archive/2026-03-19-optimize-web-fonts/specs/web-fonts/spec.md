# Web Fonts

## ADDED Requirements

### Requirement: 中英文字体栈配置

系统 SHALL 通过 CSS 变量 `--font-sans` 配置一个同时覆盖中英文的字体栈，字体加载顺序为：Geist（英文主字体）→ Inter（英文 fallback）→ Noto Sans SC（中文主字体）→ system-ui → sans-serif。

#### Scenario: 英文字符使用 Geist 渲染

- **WHEN** 页面渲染英文字符
- **THEN** 浏览器使用 Geist 字体显示

#### Scenario: 中文字符使用 Noto Sans SC 渲染

- **WHEN** 页面渲染中文字符（简体中文）
- **THEN** 浏览器使用 Noto Sans SC 字体显示

#### Scenario: 字体加载失败时使用系统字体

- **WHEN** Google Fonts 加载失败或字体文件不可用
- **THEN** 浏览器自动回退到 system-ui 字体，无 FOIT

### Requirement: 字体使用 next/font 加载

系统 SHALL 使用 next/font/google 加载 Inter 和 Noto Sans SC 字体，确保字体文件经过优化压缩并自动注入到页面。

#### Scenario: Noto Sans SC 字体正确加载

- **WHEN** 页面首次加载
- **THEN** next/font 自动下载并注入 Noto Sans SC 字体资源

#### Scenario: 字体声明正确的 CSS 变量

- **WHEN** 字体加载配置完成
- **THEN** `--font-noto-sans-sc` 变量正确注入到 HTML 元素

### Requirement: 代码等宽字体保持

系统 SHALL 保持 `--font-mono` 使用 Geist Mono 作为主字体，确保代码块和等宽内容显示正确。

#### Scenario: 代码块使用等宽字体

- **WHEN** Markdown 渲染代码块（使用 react-syntax-highlighter）
- **THEN** 代码内容使用 Geist Mono 等宽字体显示

### Requirement: Dark 模式字体渲染

系统 SHALL 确保字体在 light 和 dark 模式下均正确渲染，无视觉异常。

#### Scenario: Dark 模式中文字符显示

- **WHEN** 用户切换到 dark 模式
- **THEN** Noto Sans SC 中文字符在深色背景上清晰可读

