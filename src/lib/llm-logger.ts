import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.join(process.cwd(), 'log');

/**
 * 获取本地时间字符串（格式：2026-04-04T16:30:00+08:00）
 */
function getLocalTimestamp(): string {
  const now = new Date();
  // 使用 Intl.DateTimeFormat 获取本地时区偏移
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = now.getTimezoneOffset();
  const sign = offset <= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const minutes = String(absOffset % 60).padStart(2, '0');
  const tzString = `${sign}${hours}:${minutes}`;
  // 返回 ISO 格式但带有本地时区
  const isoString = now.toISOString();
  return isoString.slice(0, -1) + tzString;
}

/**
 * 获取本地日期字符串（格式：2026-04-04）
 */
function getLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 确保日志目录存在
 */
function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * 获取当前日期的日志文件路径
 */
function getLogFile(): string {
  const date = getLocalDate();
  return path.join(LOG_DIR, `llm-${date}.jsonl`);
}

/**
 * 写入一行日志
 */
function writeLog(obj: object): void {
  try {
    ensureLogDir();
    const line = JSON.stringify(obj) + '\n';
    fs.appendFileSync(getLogFile(), line, 'utf-8');
  } catch (err) {
    console.error('[LLM Logger] Failed to write log:', err);
  }
}

/**
 * 记录 LLM 请求的 request body
 * @param body 原始请求 body（messages, model, tools 等）
 */
export function logRequest(body: unknown): void {
  writeLog({
    type: 'request',
    timestamp: getLocalTimestamp(),
    body,
  });
}

/**
 * 记录 LLM 响应的 body
 * @param body 原始响应 body
 * @param finishReason 可选的结束原因
 */
export function logResponse(body: unknown, finishReason?: string): void {
  const log: Record<string, unknown> = {
    type: 'response',
    timestamp: getLocalTimestamp(),
    body,
  };
  if (finishReason) {
    log.finish_reason = finishReason;
  }
  writeLog(log);
}
