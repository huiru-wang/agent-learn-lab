import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import {
  getModelConfigById as getConfigById,
  getModelConfigs,
  getApiKeyWithEnvFallback,
  getBaseUrlWithEnvFallback,
} from './config';
import type { ModelConfig } from './config';

export type { ModelConfig };
export const getModelConfigById = getConfigById;

export async function createModelFromConfig(config: ModelConfig): Promise<LanguageModel> {
  const apiKey = getApiKeyWithEnvFallback(config);
  const baseURL = getBaseUrlWithEnvFallback(config);

  const openai = createOpenAI({
    apiKey,
    baseURL: baseURL || undefined,
  });

  return openai.chat(config.model);
}

export async function getModel(modelId: string): Promise<LanguageModel> {
  const config = await getModelConfigById(modelId);
  if (!config) {
    throw new Error(`Model config not found: ${modelId}`);
  }
  return createModelFromConfig(config);
}

export async function getAvailableModels(): Promise<ModelConfig[]> {
  return getModelConfigs();
}

export function getAvailableModelsSync(): ModelConfig[] {
  return [];
}
