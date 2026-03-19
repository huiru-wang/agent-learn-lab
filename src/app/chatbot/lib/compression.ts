// 滑动窗口逻辑已移至 chat.ts
// 此文件保留用于兼容性

export function getCompressionModeLabel(mode: string): string {
  return mode;
}

export function getCompressionModeDescription(mode: string): string {
  return mode;
}

export function canCompress(messages: unknown[], limit: number): { canCompress: boolean; reason?: string } {
  return { canCompress: true };
}
