/**
 * Intent Agent System Prompts
 */

import type { IntentDef } from './types';

/**
 * 构建 Intent Agent 的 system prompt
 */
export function buildSystemPrompt(intents: IntentDef[]): string {
  const intentDescriptions = intents
    .map((intent) => {
      const slotDescriptions = intent.slots
        .map(
          (slot) =>
            `    - ${slot.name} (${slot.label}): 类型=${slot.type}, ${slot.required ? '必填' : '可选'}`
        )
        .join('\n');
      return `  - ${intent.name} (${intent.label}): ${intent.description}\n    槽位:\n${slotDescriptions}`;
    })
    .join('\n');

  return `你是一个专业的意图识别系统。给定用户的自然语言输入，你需要从预定义的意图列表中进行分类，并提取相关槽位信息。

## 预定义意图列表

${intentDescriptions}

## 任务要求

1. **意图分类**: 分析用户输入，判断其最匹配的意图，并为所有预定义意图给出置信度评分（0到1之间的小数，所有意图的置信度之和应大致为1）
2. **槽位提取**: 从用户输入中提取与主意图相关的槽位值
3. **槽位归一化**: 如果槽位值可以标准化（如相对日期"明天"、"后天"转为具体日期），在 normalized 字段中提供标准化值。今天的日期是 ${new Date().toISOString().split('T')[0]}
4. **推理说明**: 简要说明你的分类推理过程

## 输出格式

请严格按照以下 JSON 格式返回结果，不要包含其他内容：

\`\`\`json
{
  "primaryIntent": {
    "name": "意图名称",
    "label": "意图中文标签",
    "confidence": 0.92
  },
  "slots": [
    {
      "name": "槽位名称",
      "label": "槽位中文标签",
      "value": "原始提取值",
      "normalized": "归一化值（如无则省略此字段）"
    }
  ],
  "allIntents": [
    {
      "name": "意图名称",
      "label": "意图中文标签",
      "confidence": 0.92
    }
  ],
  "reasoning": "推理过程说明"
}
\`\`\`

注意事项：
- allIntents 数组应包含所有预定义意图，按置信度降序排列
- 置信度应该是合理的，最匹配的意图置信度最高
- 如果用户输入不太匹配任何预定义意图，所有意图的置信度都应较低
- slots 只提取与主意图相关的槽位
- 只返回 JSON，不要有其他文字`;
}
