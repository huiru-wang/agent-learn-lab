import { NextRequest, NextResponse } from 'next/server';
import { chatCompletionStream, type ChatMessage } from '@/lib/llm-client';
import { getModelConfigById } from '@/lib/config';
import { executeTool, TOOLS, type ToolName } from '../../lib/tools';

const MAX_ITERATIONS = 10;

interface ToolCallResult {
  toolCallId: string;
  toolName: ToolName;
  arguments: Record<string, unknown>;
}

interface ChunkData {
  chunk?: {
    parsed?: {
      choices?: Array<{
        delta?: {
          content?: string;
        };
      }>;
    };
  };
}

interface ToolCallCompleteData {
  tool_calls?: Array<{
    id?: string;
    function?: {
      name?: string;
      arguments?: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const { task, model: modelId, tools: enabledTools } = body;

    if (!task || typeof task !== 'string') {
      return new Response(JSON.stringify({ error: '缺少任务描述' }), { status: 400 });
    }

    if (!modelId) {
      return new Response(JSON.stringify({ error: '缺少模型 ID' }), { status: 400 });
    }

    const modelConfig = await getModelConfigById(modelId);
    if (!modelConfig) {
      return new Response(JSON.stringify({ error: `模型未找到: ${modelId}` }), { status: 400 });
    }

    // 构建 System Prompt
    const toolsDescription = enabledTools
      .map((t: ToolName) => `- ${t}: ${TOOLS.find((tool) => tool.name === t)?.description}`)
      .join('\n');

    const systemPrompt = `你是一个 ReAct (Reasoning + Acting) Agent。

## 你的工作方式
1. 先进行推理思考（Thought），用中文说明
2. 如果需要执行工具，使用工具调用
3. 观察工具返回结果
4. 根据结果继续或给出最终答案

## 可用工具
${toolsDescription}

## 重要规则
- 每次回复先用"思考:"开头说明推理过程
- 如果需要工具，明确说要使用什么工具
- 如果已有足够信息，给出"最终答案: xxx"

现在开始执行任务。`;

    // 消息历史
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: task },
    ];

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        let iteration = 0;
        let totalUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

        send({ type: 'request', request: { model: modelConfig.model, messages: messages.slice(1) } });

        while (iteration < MAX_ITERATIONS) {
          iteration++;

          let accumulatedContent = '';
          let toolCallResults: ToolCallResult[] = [];
          let currentToolCalls: Array<{ id: string; function: { name: string; arguments: string } }> = [];

          // 流式读取 LLM 响应
          for await (const event of chatCompletionStream({
            model: modelConfig,
            messages,
            stream: true,
            tools: enabledTools.map((name: ToolName) => {
              const tool = TOOLS.find((t) => t.name === name)!;
              return {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
              };
            }),
          })) {
            if (event.type === 'chunk') {
              // 累积 content 用于 UI 展示
              const chunkData = event.data as ChunkData;
              const delta = chunkData.chunk?.parsed?.choices?.[0]?.delta;
              if (delta?.content) {
                accumulatedContent += delta.content;
                send({ type: 'thought_delta', delta: delta.content });
              }
            } else if (event.type === 'tool_call_complete') {
              // 从 tool_call_complete 事件获取所有工具调用结果
              const tcData = event.data as ToolCallCompleteData;
              currentToolCalls = tcData.tool_calls?.map((tc) => ({
                id: tc.id || `call_${Date.now()}`,
                function: {
                  name: tc.function?.name || '',
                  arguments: tc.function?.arguments || '',
                },
              })) || [];
              // 解析所有工具调用
              toolCallResults = tcData.tool_calls?.map((tc) => {
                let args: Record<string, unknown> = {};
                try {
                  args = JSON.parse(tc.function?.arguments || '{}');
                } catch {
                  // ignore
                }
                return {
                  toolCallId: tc.id || `call_${Date.now()}`,
                  toolName: tc.function?.name as ToolName,
                  arguments: args,
                };
              }) || [];
            } else if (event.type === 'done') {
              const doneData = event.data as { usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } };
              if (doneData.usage) {
                totalUsage = doneData.usage;
              }
            } else if (event.type === 'error') {
              const errData = event.data as { error: string };
              send({ type: 'error', error: errData.error });
              controller.close();
              return;
            }
          }

          // 发送完整思考
          if (accumulatedContent.trim()) {
            send({ type: 'thought', thought: accumulatedContent });
          }

          // 先处理工具调用（如果有）
          let hasToolCalls = false;
          if (toolCallResults.length > 0) {
            hasToolCalls = true;
            // 遍历所有工具调用
            for (const toolCallResult of toolCallResults) {
              if (!enabledTools.includes(toolCallResult.toolName)) continue;

              send({ type: 'action', toolName: toolCallResult.toolName, arguments: toolCallResult.arguments });

              const observation = executeTool(toolCallResult.toolName, toolCallResult.arguments);
              send({ type: 'observation', observation });

              // 更新消息历史 - 包含 tool_calls
              messages.push({
                role: 'assistant',
                content: accumulatedContent || `[调用工具: ${toolCallResult.toolName}]`,
                tool_calls: currentToolCalls.map((tc) => ({
                  id: tc.id,
                  type: 'function' as const,
                  function: {
                    name: tc.function.name,
                    arguments: tc.function.arguments,
                  },
                })),
              });
              messages.push({
                role: 'tool',
                content: observation,
                tool_call_id: toolCallResult.toolCallId,
                name: toolCallResult.toolName,
              });
            }
          }

          // 检查是否包含最终答案（只在没有工具调用时才检查）
          const finalAnswerMatch = accumulatedContent.match(/(?:最终答案|Final Answer)[:：]?\s*(.+)/i);
          if (finalAnswerMatch && !hasToolCalls) {
            send({ type: 'final_answer', answer: finalAnswerMatch[1].trim() });
            send({ type: 'done', usage: totalUsage });
            controller.close();
            return;
          } else if (accumulatedContent.trim()) {
            // 有思考但没有工具调用和最终答案，继续推理
            messages.push({ role: 'assistant', content: accumulatedContent });
          } else {
            // 无输出，强制终止
            break;
          }
        }

        // 达到最大迭代次数
        send({ type: 'error', error: `执行已达最大迭代次数 (${MAX_ITERATIONS})` });
        send({ type: 'done', usage: totalUsage });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
