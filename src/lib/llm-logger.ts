import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.join(process.cwd(), 'log');

// 确保日志目录存在
function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

export interface LLMCallLog {
  timestamp: string;
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: unknown;
  };
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: unknown;
  };
  duration?: number; // 请求耗时（毫秒）
  stream?: boolean;
  error?: string;
}

export function maskApiKeyInHeaders(headers: Record<string, string>): Record<string, string> {
  const masked = { ...headers };
  if (masked['Authorization']) {
    const auth = masked['Authorization'];
    if (auth.startsWith('Bearer ')) {
      const key = auth.slice(7);
      if (key.length > 8) {
        masked['Authorization'] = `Bearer ${key.slice(0, 4)}***${key.slice(-4)}`;
      } else {
        masked['Authorization'] = 'Bearer ***';
      }
    }
  }
  return masked;
}

export function writeLLMCallLog(log: LLMCallLog): void {
  try {
    ensureLogDir();
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `llm-${date}.jsonl`);
    const line = JSON.stringify(log) + '\n';
    fs.appendFileSync(logFile, line, 'utf-8');
  } catch (err) {
    console.error('[LLM Logger] Failed to write log:', err);
  }
}

export function createLLMCallLogger(stream: boolean = false) {
  const startTime = Date.now();
  let request: LLMCallLog['request'] | null = null;
  let response: LLMCallLog['response'] | undefined = undefined;

  return {
    setRequest(req: LLMCallLog['request']) {
      request = {
        url: req.url,
        method: req.method,
        headers: maskApiKeyInHeaders(req.headers),
        body: req.body,
      };
    },
    setResponse(res: LLMCallLog['response']) {
      response = res;
    },
    setError(error: string) {
      const log: LLMCallLog = {
        timestamp: new Date().toISOString(),
        request: request!,
        stream,
        error,
        duration: Date.now() - startTime,
      };
      writeLLMCallLog(log);
    },
    flush() {
      if (!request) return;
      const log: LLMCallLog = {
        timestamp: new Date().toISOString(),
        request,
        response,
        stream,
        duration: Date.now() - startTime,
      };
      writeLLMCallLog(log);
    },
  };
}
