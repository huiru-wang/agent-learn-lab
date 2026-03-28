import type { ToolDefinition } from '@/lib/tool-types';

// get_time 工具的 JSON Schema 定义
export const getTimeDefinition: ToolDefinition = {
    name: 'get_time',
    description: '获取指定时区的当前时间。支持全球各时区，默认返回上海时间。',
    parameters: {
        type: 'object',
        properties: {
            timezone: {
                type: 'string',
                description: 'IANA 时区名称，例如 Asia/Shanghai、America/New_York、Europe/London。默认为 Asia/Shanghai。',
            },
            format: {
                type: 'string',
                description: '返回格式：full（完整日期时间）、date（仅日期）、time（仅时间）。默认为 full。',
                enum: ['full', 'date', 'time'],
            },
        },
        required: [],
    },
};

interface GetTimeArgs {
    timezone?: string;
    format?: 'full' | 'date' | 'time';
}

export function executeGetTime(args: GetTimeArgs): string {
    const tz = args.timezone || 'Asia/Shanghai';
    const fmt = args.format || 'full';
    const now = new Date();

    try {
        switch (fmt) {
            case 'date':
                return now.toLocaleDateString('zh-CN', { timeZone: tz });
            case 'time':
                return now.toLocaleTimeString('zh-CN', { timeZone: tz });
            case 'full':
            default:
                return now.toLocaleString('zh-CN', { timeZone: tz });
        }
    } catch {
        // 时区无效时回退到本地时间
        return now.toLocaleString('zh-CN');
    }
}

// 工具执行函数映射
export const toolExecutors: Record<string, (args: Record<string, unknown>) => string> = {
    get_time: (args) => executeGetTime(args as GetTimeArgs),
};

// 所有可用工具定义列表
export const allToolDefinitions: ToolDefinition[] = [getTimeDefinition];
