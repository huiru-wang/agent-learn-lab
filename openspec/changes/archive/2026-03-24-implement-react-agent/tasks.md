## 1. 基础结构搭建

- [x] 1.1 创建 react-agent 目录结构（components/、lib/、api/、docs/）
- [x] 1.2 创建 `lib/tools.ts` - 定义 weather_api（蓝）、calculator（绿）、search（橙）三个模拟工具，包含工具描述和模拟响应
- [x] 1.3 创建 `lib/store.ts` - Zustand store，定义状态类型（idle/running/paused/done/replaying）和 actions

## 2. API 实现

- [x] 2.1 创建 `api/execute/route.ts` - POST 接口，通过 SSE 流式返回
- [x] 2.2 实现 LLM 调用逻辑，使用 `llm-client.ts` 流式接口，累积 tool_calls
- [x] 2.3 实现 ReAct 循环逻辑 - 累积 messages，判断 Action 并执行工具
- [x] 2.4 实现模拟工具执行函数（weather_api、calculator、search）
- [x] 2.5 实现循环终止判断（检测 "Final Answer:" 或 max iterations=10）
- [x] 2.6 实现错误处理 - JSON 解析容错、工具执行异常捕获

## 3. 前端组件

- [x] 3.1 创建 `page.tsx` - 页面布局（左侧输入区 + 右侧轨迹区，参考 intent-agent）
- [x] 3.2 创建 `components/InputPanel.tsx` - 任务输入 Textarea、工具复选列表、执行/单步/清空按钮
- [x] 3.3 创建 `components/ToolSelector.tsx` - 工具复选框组件，带颜色标识
- [x] 3.4 创建 `components/ExecutionTrace.tsx` - 步骤时间线容器，ScrollArea 包裹
- [x] 3.5 创建 `components/StepCard.tsx` - 单个步骤卡片（Thought/Action/Observation），支持折叠/展开
- [x] 3.6 创建 `components/DebugControls.tsx` - 单步执行、继续执行、回放、停止按钮，速度选择器
- [x] 3.7 创建 `components/FinalAnswer.tsx` - 最终答案展示卡片
- [x] 3.8 创建 `components/EmptyState.tsx` - 空状态引导提示

## 4. 状态与交互

- [x] 4.1 实现 `lib/chat.ts` - SSE 客户端，处理事件类型：thought_delta、action、observation、final_answer、done、error
- [x] 4.2 实现单步执行模式 - 完整执行后在客户端实现暂停在每个步骤
- [x] 4.3 实现回放功能 - 依次高亮步骤，支持 0.5x/1x/2x 速度
- [x] 4.4 实现工具颜色高亮 - Action 卡片左边框使用工具对应颜色
- [x] 4.5 实现输入验证 - 空输入/未选工具时禁用执行按钮
- [x] 4.6 实现执行中状态 - 输入框禁用，按钮状态更新

## 5. 文档

- [x] 5.1 创建 `docs/index.md` - ReAct 核心概念说明（Thought/Action/Observation 循环）
