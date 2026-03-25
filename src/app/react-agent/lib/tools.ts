// ── 工具定义 ────────────────────────────────────────────────────

import type { ToolDefinition } from '@/lib/tool-types';

// 本地工具名称类型
export type ToolName = 'weather_api' | 'calculator' | 'search';

// 本地工具（包含 UI 相关属性）
export interface Tool {
  name: ToolName;
  description: string;
  color: string; // 边框颜色
}

// 工具调用请求
export interface ToolCall {
  name: ToolName;
  arguments: Record<string, unknown>;
}

// 导出共享的 ToolDefinition 类型（用于 LLM 工具调用）
export type { ToolDefinition };

// 工具颜色配置
export const TOOL_COLORS: Record<ToolName, string> = {
  weather_api: 'border-blue-500',
  calculator: 'border-green-500',
  search: 'border-orange-500',
};

// ── 工具参数 Schema ───────────────────────────────────────────────

interface ToolParameter {
  type: string;
  description: string;
}

interface ToolSchema {
  type: 'object';
  properties: Record<string, ToolParameter>;
  required: string[];
}

// 工具参数定义
export const TOOL_SCHEMAS: Record<ToolName, ToolSchema> = {
  weather_api: {
    type: 'object',
    properties: {
      city: { type: 'string', description: '城市名称，例如：北京、上海' },
    },
    required: ['city'],
  },
  calculator: {
    type: 'object',
    properties: {
      expression: { type: 'string', description: '数学表达式，例如：123 * 456 + 789' },
    },
    required: ['expression'],
  },
  search: {
    type: 'object',
    properties: {
      query: { type: 'string', description: '搜索关键词' },
    },
    required: ['query'],
  },
};

// 工具定义（包含完整 schema）
export const TOOLS: (Tool & { parameters: ToolSchema })[] = [
  {
    name: 'weather_api',
    description: '查询城市天气，返回城市名、天气状况、温度等信息',
    color: TOOL_COLORS.weather_api,
    parameters: TOOL_SCHEMAS.weather_api,
  },
  {
    name: 'calculator',
    description: '执行数学计算，支持加减乘除、幂运算等',
    color: TOOL_COLORS.calculator,
    parameters: TOOL_SCHEMAS.calculator,
  },
  {
    name: 'search',
    description: '搜索互联网，返回相关结果摘要',
    color: TOOL_COLORS.search,
    parameters: TOOL_SCHEMAS.search,
  },
];

// ── 模拟工具执行 ────────────────────────────────────────────────

function simulateWeatherApi(args: Record<string, unknown>): string {
  const city = args.city as string || '未知城市';
  // 模拟天气数据
  const weathers = ['晴天', '多云', '阴天', '小雨', '雷阵雨'];
  const temps = [18, 22, 25, 28, 30, 32];
  const weather = weathers[Math.floor(Math.random() * weathers.length)];
  const temp = temps[Math.floor(Math.random() * temps.length)];
  return JSON.stringify({
    city,
    weather,
    temperature: temp,
    humidity: Math.floor(Math.random() * 40) + 40,
    wind: `${Math.floor(Math.random() * 5) + 1}级`,
  });
}

function simulateCalculator(args: Record<string, unknown>): string {
  const expression = args.expression as string;
  if (!expression) {
    return JSON.stringify({ error: '缺少计算表达式' });
  }
  try {
    // 安全的计算器实现，只支持基本运算
    const sanitized = expression.replace(/[^0-9+\-*/().^%\s]/g, '');
    // 使用 Function 构造器进行计算（比 eval 稍安全，但仍需注意）
    const result = Function(`"use strict"; return (${sanitized})`)();
    return JSON.stringify({ expression, result });
  } catch {
    return JSON.stringify({ error: `无法计算表达式: ${expression}` });
  }
}

function simulateSearch(args: Record<string, unknown>): string {
  const query = args.query as string || '';
  // 模拟搜索结果
  const results = [
    { title: `${query} - 维基百科`, url: 'https://zh.wikipedia.org', snippet: `关于${query}的详细百科信息...` },
    { title: `${query} - 百度百科`, url: 'https://baike.baidu.com', snippet: `百度百科收录的${query}词条...` },
    { title: `${query} - 知乎`, url: 'https://zhihu.com', snippet: `知乎上关于${query}的讨论...` },
  ];
  return JSON.stringify({
    query,
    results: results.slice(0, 2),
    total: results.length,
  });
}

// 将本地工具转换为 ToolDefinition 格式（用于 LLM 工具调用）
export function toToolDefinitions(): ToolDefinition[] {
  return TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters as unknown as Record<string, unknown>,
  }));
}

// 工具执行入口
export function executeTool(toolName: ToolName, args: Record<string, unknown>): string {
  switch (toolName) {
    case 'weather_api':
      return simulateWeatherApi(args);
    case 'calculator':
      return simulateCalculator(args);
    case 'search':
      return simulateSearch(args);
    default:
      return JSON.stringify({ error: `未知工具: ${toolName}` });
  }
}
