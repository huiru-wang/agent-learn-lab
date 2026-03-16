import { promises as fs } from 'fs';
import path from 'path';

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

interface ModelsConfigFile {
  models: ModelConfig[];
}

let cachedConfig: ModelsConfigFile | null = null;

async function loadConfig(): Promise<ModelsConfigFile> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const configPath = path.join(process.cwd(), 'models.config.json');
    const content = await fs.readFile(configPath, 'utf-8');
    cachedConfig = JSON.parse(content);
    return cachedConfig!;
  } catch {
    console.warn('models.config.json not found, using empty config');
    return { models: [] };
  }
}

export async function getModelConfigs(): Promise<ModelConfig[]> {
  const config = await loadConfig();
  return config.models;
}

export async function getModelConfigById(id: string): Promise<ModelConfig | undefined> {
  const models = await getModelConfigs();
  return models.find((m) => m.id === id);
}

export function getApiKeyWithEnvFallback(config: ModelConfig): string {
  if (config.apiKey) {
    return config.apiKey;
  }

  const envKey = `${config.provider.toUpperCase()}_API_KEY`;
  return process.env[envKey] || '';
}

export function getBaseUrlWithEnvFallback(config: ModelConfig): string | undefined {
  if (config.baseUrl) {
    return config.baseUrl;
  }

  const envKey = `${config.provider.toUpperCase()}_BASE_URL`;
  return process.env[envKey] || undefined;
}
