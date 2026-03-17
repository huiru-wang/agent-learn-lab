import type { Message, CompressedMessage, CompressionMode } from './store';

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface CompressionResult {
  messages: Message[];
  compressedMessages: CompressedMessage[];
  compressedIds: string[];
}

export function compressMessages(
  messages: Message[],
  mode: CompressionMode,
  contextLimit: number
): CompressionResult {
  if (messages.length < 4) {
    return { messages, compressedMessages: [], compressedIds: [] };
  }

  switch (mode) {
    case 'sliding-window':
      return slidingWindowCompression(messages, contextLimit);
    case 'summary':
      return summaryCompression(messages, contextLimit);
    case 'importance':
      return importanceCompression(messages, contextLimit);
    case 'hierarchical':
      return hierarchicalCompression(messages, contextLimit);
    default:
      return { messages, compressedMessages: [], compressedIds: [] };
  }
}

export function canCompress(
  messages: Message[],
  contextLimit: number
): { canCompress: boolean; reason: string } {
  const totalTokens = messages.reduce((sum, m) => sum + (m.tokenCount || estimateTokens(m.content)), 0);
  const usagePercent = (totalTokens / contextLimit) * 100;

  if (messages.length < 4) {
    return { canCompress: false, reason: `消息数量不足（当前 ${messages.length} 条，需要至少 4 条）` };
  }

  if (usagePercent < 60) {
    return { canCompress: false, reason: `上下文使用率较低（当前 ${usagePercent.toFixed(1)}%，建议 60% 以上）` };
  }

  return { canCompress: true, reason: '' };
}

function slidingWindowCompression(
  messages: Message[],
  contextLimit: number
): CompressionResult {
  const systemMessages = messages.filter((m) => m.role === 'system');
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  let currentTokens = systemMessages.reduce((sum, m) => sum + (m.tokenCount || estimateTokens(m.content)), 0);
  const compressedIds: string[] = [];
  const compressedMessages: CompressedMessage[] = [];

  const recentMessages = [...conversationMessages].reverse();
  const retainedIds = new Set<string>();

  for (const msg of recentMessages) {
    const msgTokens = msg.tokenCount || estimateTokens(msg.content);
    if (currentTokens + msgTokens <= contextLimit * 0.8) {
      retainedIds.add(msg.id);
      currentTokens += msgTokens;
    }
  }

  const toCompress = conversationMessages.filter((m) => !retainedIds.has(m.id));
  toCompress.forEach((m) => compressedIds.push(m.id));

  const result: Message[] = [];
  let summaryInserted = false;

  for (const msg of messages) {
    if (toCompress.some((m) => m.id === msg.id)) {
      result.push({ ...msg, isCompressed: true });
      if (!summaryInserted && toCompress.length > 0) {
        const summary = generateSimpleSummary(toCompress);
        result.push({
          id: `summary-${Date.now()}`,
          role: 'system',
          content: `📄 压缩摘要\n${summary}`,
          timestamp: Date.now(),
          tokenCount: estimateTokens(summary),
          isSummary: true,
        });
        compressedMessages.push({
          id: `compressed-${Date.now()}`,
          originalIds: toCompress.map((m) => m.id),
          summary,
          timestamp: Date.now(),
          tokenCount: estimateTokens(summary),
          originalTokenCount: toCompress.reduce((sum, m) => sum + (m.tokenCount || estimateTokens(m.content)), 0),
        });
        summaryInserted = true;
      }
    } else {
      result.push(msg);
    }
  }

  return { messages: result, compressedMessages, compressedIds };
}

function summaryCompression(
  messages: Message[],
  contextLimit: number
): CompressionResult {
  const systemMessages = messages.filter((m) => m.role === 'system');
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  if (conversationMessages.length <= 2) {
    return { messages, compressedMessages: [], compressedIds: [] };
  }

  const recentCount = Math.min(4, conversationMessages.length);
  const recentMessages = conversationMessages.slice(-recentCount);
  const oldMessages = conversationMessages.slice(0, -recentCount);

  const compressedIds = oldMessages.map((m) => m.id);
  const compressedMessages: CompressedMessage[] = [];

  const summary = generateDetailedSummary(oldMessages);
  compressedMessages.push({
    id: `compressed-${Date.now()}`,
    originalIds: oldMessages.map((m) => m.id),
    summary,
    timestamp: Date.now(),
    tokenCount: estimateTokens(summary),
    originalTokenCount: oldMessages.reduce((sum, m) => sum + (m.tokenCount || estimateTokens(m.content)), 0),
  });

  const result: Message[] = [];
  let oldSectionEnded = false;

  for (const msg of messages) {
    if (oldMessages.some((m) => m.id === msg.id)) {
      result.push({ ...msg, isCompressed: true });
      if (!oldSectionEnded) {
        result.push({
          id: `summary-${Date.now()}`,
          role: 'system',
          content: `📄 历史摘要\n${summary}`,
          timestamp: Date.now(),
          tokenCount: estimateTokens(summary),
          isSummary: true,
        });
        oldSectionEnded = true;
      }
    } else {
      result.push(msg);
    }
  }

  return { messages: result, compressedMessages, compressedIds };
}

function importanceCompression(
  messages: Message[],
  contextLimit: number
): CompressionResult {
  const scoredMessages = messages.map((m) => ({
    ...m,
    importanceScore: calculateImportance(m),
  }));

  const systemMessages = scoredMessages.filter((m) => m.role === 'system');
  const otherMessages = scoredMessages.filter((m) => m.role !== 'system');

  let currentTokens = systemMessages.reduce((sum, m) => sum + (m.tokenCount || estimateTokens(m.content)), 0);
  const retainedIds = new Set<string>();

  for (const msg of otherMessages) {
    const msgTokens = msg.tokenCount || estimateTokens(msg.content);
    if (currentTokens + msgTokens <= contextLimit * 0.85) {
      retainedIds.add(msg.id);
      currentTokens += msgTokens;
    }
  }

  const toCompress = otherMessages.filter((m) => !retainedIds.has(m.id));
  const compressedIds = toCompress.map((m) => m.id);
  const compressedMessages: CompressedMessage[] = [];

  if (toCompress.length > 0) {
    const summary = generateImportanceSummary(toCompress);
    compressedMessages.push({
      id: `compressed-${Date.now()}`,
      originalIds: toCompress.map((m) => m.id),
      summary,
      timestamp: Date.now(),
      tokenCount: estimateTokens(summary),
      originalTokenCount: toCompress.reduce((sum, m) => sum + (m.tokenCount || estimateTokens(m.content)), 0),
    });
  }

  const result: Message[] = [];
  let lastWasCompressed = false;

  for (const msg of messages) {
    if (compressedIds.includes(msg.id)) {
      result.push({ ...msg, isCompressed: true });
      lastWasCompressed = true;
    } else {
      if (lastWasCompressed && compressedMessages.length > 0) {
        result.push({
          id: `summary-${Date.now()}`,
          role: 'system',
          content: `📄 重要内容摘要\n${compressedMessages[0].summary}`,
          timestamp: Date.now(),
          tokenCount: compressedMessages[0].tokenCount,
          isSummary: true,
        });
        lastWasCompressed = false;
      }
      result.push(msg);
    }
  }

  return { messages: result, compressedMessages, compressedIds };
}

function hierarchicalCompression(
  messages: Message[],
  contextLimit: number
): CompressionResult {
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  const totalGroups = Math.ceil(conversationMessages.length / 4);
  const recentGroupCount = Math.max(1, Math.floor(totalGroups * 0.3));

  const recentGroupSize = recentGroupCount * 4;
  const recentMessages = conversationMessages.slice(-recentGroupSize);
  const midMessages = conversationMessages.slice(-recentGroupSize * 2, -recentGroupSize);
  const oldMessages = conversationMessages.slice(0, -recentGroupSize * 2);

  const compressedIds: string[] = [
    ...oldMessages.map((m) => m.id),
    ...midMessages.map((m) => m.id),
  ];
  const compressedMessages: CompressedMessage[] = [];

  const oldIds = new Set(oldMessages.map((m) => m.id));
  const midIds = new Set(midMessages.map((m) => m.id));

  const result: Message[] = [];
  let oldSummaryInserted = false;
  let midSummaryInserted = false;

  for (const msg of messages) {
    if (oldIds.has(msg.id)) {
      result.push({ ...msg, isCompressed: true });
      if (!oldSummaryInserted && oldMessages.length > 0) {
        const oldSummary = generateDetailedSummary(oldMessages);
        result.push({
          id: `summary-old-${Date.now()}`,
          role: 'system',
          content: `📄 早期对话摘要\n${oldSummary}`,
          timestamp: Date.now(),
          tokenCount: estimateTokens(oldSummary),
          isSummary: true,
        });
        compressedMessages.push({
          id: `compressed-old-${Date.now()}`,
          originalIds: oldMessages.map((m) => m.id),
          summary: oldSummary,
          timestamp: Date.now(),
          tokenCount: estimateTokens(oldSummary),
          originalTokenCount: oldMessages.reduce((sum, m) => sum + (m.tokenCount || estimateTokens(m.content)), 0),
        });
        oldSummaryInserted = true;
      }
    } else if (midIds.has(msg.id)) {
      result.push({ ...msg, isCompressed: true });
      if (!midSummaryInserted && midMessages.length > 0) {
        const midSummary = generateSimpleSummary(midMessages);
        result.push({
          id: `summary-mid-${Date.now()}`,
          role: 'system',
          content: `📄 中期对话概要\n${midSummary}`,
          timestamp: Date.now(),
          tokenCount: estimateTokens(midSummary),
          isSummary: true,
        });
        compressedMessages.push({
          id: `compressed-mid-${Date.now()}`,
          originalIds: midMessages.map((m) => m.id),
          summary: midSummary,
          timestamp: Date.now(),
          tokenCount: estimateTokens(midSummary),
          originalTokenCount: midMessages.reduce((sum, m) => sum + (m.tokenCount || estimateTokens(m.content)), 0),
        });
        midSummaryInserted = true;
      }
    } else {
      result.push(msg);
    }
  }

  return { messages: result, compressedMessages, compressedIds };
}

function calculateImportance(message: Message): number {
  let score = 0;
  const content = message.content.toLowerCase();

  if (content.includes('代码') || content.includes('code') || content.includes('函数') || content.includes('function')) {
    score += 30;
  }
  if (content.includes('错误') || content.includes('error') || content.includes('问题') || content.includes('problem')) {
    score += 25;
  }
  if (content.includes('重要') || content.includes('important') || content.includes('关键')) {
    score += 20;
  }
  if (/\d/.test(content)) {
    score += 10;
  }
  if (/```|`[^`]+`/.test(content)) {
    score += 15;
  }
  const length = message.content.length;
  if (length > 500) score += 15;
  else if (length > 200) score += 10;
  else if (length < 50) score -= 10;

  const greetings = ['你好', 'hello', 'hi', '嗨', '嗨', '谢谢', 'thank', '再见', 'bye'];
  if (greetings.some((g) => content.includes(g))) {
    score -= 15;
  }

  return Math.max(0, score);
}

function generateSimpleSummary(messages: Message[]): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  const assistantMessages = messages.filter((m) => m.role === 'assistant');

  const topics: string[] = [];
  userMessages.forEach((m) => {
    const words = m.content.split(/[\s,，。？?！!]+/).filter((w) => w.length > 2);
    topics.push(...words.slice(0, 3));
  });

  return `共 ${messages.length} 条消息压缩。用户询问了 ${userMessages.length} 个问题，` +
    `助手回答了 ${assistantMessages.length} 次。主要话题：${[...new Set(topics)].slice(0, 5).join('、')}。`;
}

function generateDetailedSummary(messages: Message[]): string {
  const pairs: string[] = [];
  for (let i = 0; i < messages.length; i += 2) {
    const user = messages[i];
    const assistant = messages[i + 1];
    if (user?.role === 'user') {
      let pair = `Q: ${truncate(user.content, 50)}`;
      if (assistant?.role === 'assistant') {
        pair += ` → A: ${truncate(assistant.content, 50)}`;
      }
      pairs.push(pair);
    }
  }
  return `对话历史要点：\n${pairs.join('\n')}`;
}

function generateImportanceSummary(messages: Message[]): string {
  const important: string[] = [];
  messages.forEach((m) => {
    const score = calculateImportance(m);
    if (score > 15) {
      important.push(`${m.role === 'user' ? '用户' : '助手'}: ${truncate(m.content, 60)}`);
    }
  });

  if (important.length === 0) {
    return generateSimpleSummary(messages);
  }

  return `重要内容摘要：\n${important.join('\n')}`;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

export function getCompressionModeLabel(mode: CompressionMode): string {
  const labels: Record<CompressionMode, string> = {
    'sliding-window': '滑动窗口',
    'summary': '摘要压缩',
    'importance': '重要性评分',
    'hierarchical': '分层压缩',
  };
  return labels[mode];
}

export function getCompressionModeDescription(mode: CompressionMode): string {
  const descriptions: Record<CompressionMode, string> = {
    'sliding-window': '保留最近N轮对话，旧消息被丢弃或压缩',
    'summary': '将历史对话压缩成摘要，保留关键信息',
    'importance': '根据消息重要性评分选择性保留',
    'hierarchical': '近期完整保留，中期压缩，远期高度压缩',
  };
  return descriptions[mode];
}
