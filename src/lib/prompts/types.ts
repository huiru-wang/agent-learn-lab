/**
 * System Prompts 类型定义
 */

export interface SlotDef {
  name: string;
  label: string;
  type: 'string' | 'date' | 'number' | 'enum';
  required: boolean;
}

export interface IntentDef {
  name: string;
  label: string;
  description: string;
  slots: SlotDef[];
}

export interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}
