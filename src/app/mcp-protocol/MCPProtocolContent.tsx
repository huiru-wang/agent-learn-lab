'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DocsPanel } from '../chatbot/components/docs-panel';
import { useMCPStore } from './lib/store';
import { ToolList } from './components/tool-list';
import { ResourceBrowser } from './components/resource-browser';
import { PromptBrowser } from './components/prompt-browser';
import { InteractionPanel } from './components/interaction-panel';
import { ExecutionTrace } from './components/execution-trace';
import { ServerPanel } from './components/server-panel';

export default function MCPProtocolContent() {
  const [activeTab, setActiveTab] = useState('demo');
  const [browserTab, setBrowserTab] = useState<'tools' | 'resources' | 'prompts'>('tools');
  const [executingToolName, setExecutingToolName] = useState<string | null>(null);

  const { currentSessionId, addCallLog } = useMCPStore();

  const handleExecuteTool = async (toolName: string, args: Record<string, unknown>) => {
    if (!currentSessionId) return;

    setExecutingToolName(toolName);

    addCallLog({
      type: 'tool_call',
      title: `Tool Call: ${toolName}`,
      detail: {
        request: { name: toolName, arguments: args },
        response: null,
      },
    });

    try {
      const response = await fetch('/api/mcp/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          method: 'callTool',
          toolName,
          arguments: args,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Tool call failed');
      }

      addCallLog({
        type: 'tool_result',
        title: `Tool Result: ${toolName}`,
        detail: {
          request: null,
          response: data.result,
        },
      });
    } catch (error) {
      addCallLog({
        type: 'tool_result',
        title: `Tool Error: ${toolName}`,
        detail: {
          request: null,
          response: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      });
    } finally {
      setExecutingToolName(null);
    }
  };

  const handleReadResource = async (uri: string) => {
    if (!currentSessionId) return;

    addCallLog({
      type: 'resource_read',
      title: `Resource Read: ${uri.split('/').pop() || uri}`,
      detail: {
        request: { uri },
        response: null,
      },
    });

    try {
      const response = await fetch('/api/mcp/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          method: 'readResource',
          uri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Resource read failed');
      }

      addCallLog({
        type: 'resource_read',
        title: `Resource Read: ${uri.split('/').pop() || uri}`,
        detail: {
          request: null,
          response: data.contents,
        },
      });
    } catch (error) {
      addCallLog({
        type: 'resource_read',
        title: `Resource Error: ${uri.split('/').pop() || uri}`,
        detail: {
          request: null,
          response: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      });
    }
  };

  const handleGetPrompt = async (name: string, args: Record<string, unknown>) => {
    if (!currentSessionId) return;

    addCallLog({
      type: 'prompt_get',
      title: `Get Prompt: ${name}`,
      detail: {
        request: { name, arguments: args },
        response: null,
      },
    });

    try {
      const response = await fetch('/api/mcp/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          method: 'getPrompt',
          name,
          arguments: args,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Get prompt failed');
      }

      addCallLog({
        type: 'prompt_get',
        title: `Get Prompt: ${name}`,
        detail: {
          request: null,
          response: data.prompt,
        },
      });
    } catch (error) {
      addCallLog({
        type: 'prompt_get',
        title: `Prompt Error: ${name}`,
        detail: {
          request: null,
          response: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      });
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)} className="flex flex-col h-full">
      <div className="border-b px-4 py-2 bg-muted/30">
        <TabsList className="h-9">
          <TabsTrigger value="demo" className="text-base font-medium">演示</TabsTrigger>
          <TabsTrigger value="docs" className="text-base font-medium">文档</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="demo" className="flex-1 m-0 p-0 overflow-hidden">
        <div className="flex h-full overflow-hidden">
          {/* 左侧面板 (60%) */}
          <div
            className="flex-1 flex flex-col min-w-0 border-r overflow-hidden"
            style={{ flexBasis: '60%', maxWidth: '60%' }}
          >
            {/* Server Panel */}
            <div className="px-4 pt-4 pb-3 border-b bg-muted/5 flex-shrink-0">
              <ServerPanel />
            </div>

            {/* Browser Tabs */}
            <div className="border-b bg-muted/5 px-4">
              <Tabs value={browserTab} onValueChange={(v) => v && setBrowserTab(v as typeof browserTab)}>
                <TabsList className="h-8">
                  <TabsTrigger value="tools" className="text-xs px-3">Tools</TabsTrigger>
                  <TabsTrigger value="resources" className="text-xs px-3">Resources</TabsTrigger>
                  <TabsTrigger value="prompts" className="text-xs px-3">Prompts</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Browser Content */}
            <div className="flex-1 overflow-auto p-4">
              {browserTab === 'tools' && (
                <ToolList
                  onExecuteTool={handleExecuteTool}
                  executingToolName={executingToolName}
                />
              )}
              {browserTab === 'resources' && (
                <ResourceBrowser onReadResource={handleReadResource} />
              )}
              {browserTab === 'prompts' && (
                <PromptBrowser onGetPrompt={handleGetPrompt} />
              )}
            </div>

            {/* Interaction Panel */}
            <div className="border-t bg-muted/5 p-4 flex-shrink-0 max-h-64 overflow-auto">
              <InteractionPanel
                onExecuteTool={handleExecuteTool}
                onReadResource={handleReadResource}
                onGetPrompt={handleGetPrompt}
                executingToolName={executingToolName}
              />
            </div>
          </div>

          {/* 右侧执行轨迹 (40%) */}
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{ flexBasis: '40%', width: '40%' }}
          >
            <ExecutionTrace />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="docs" className="flex-1 m-0 p-0 overflow-hidden">
        <DocsPanel modulePath="/mcp-protocol" />
      </TabsContent>
    </Tabs>
  );
}
