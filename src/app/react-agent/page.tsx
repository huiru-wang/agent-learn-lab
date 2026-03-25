'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DocsPanel } from '../chatbot/components/docs-panel';
import { InputPanel } from './components/InputPanel';
import { ExecutionTrace } from './components/ExecutionTrace';
import { useReactAgentStore } from './lib/store';
import { Badge } from '@/components/ui/badge';

interface MCPToolInfo {
  name: string;
  serverName: string;
  description?: string;
  inputSchema: unknown;
}

interface MCPServer {
  name: string;
  isBuiltin: boolean;
  tools: MCPToolInfo[];
}

export default function ReactAgentPage() {
  const [activeTab, setActiveTab] = useState('demo');
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const { enabledTools, toggleTool } = useReactAgentStore();

  useEffect(() => {
    async function fetchMCPTools() {
      try {
        const res = await fetch('/api/react-agent/mcp-tools');
        const data = await res.json();

        const servers: MCPServer[] = [];

        // 添加内置服务器
        if (data.builtins) {
          for (const b of data.builtins) {
            const tools = (data.tools[b.name] || []).map((t: { name: string; description?: string; inputSchema: unknown }) => ({
              name: t.name,
              serverName: b.name,
              description: t.description,
              inputSchema: t.inputSchema,
            }));
            servers.push({ name: b.name, isBuiltin: true, tools });
          }
        }

        // 添加用户服务器
        if (data.servers) {
          for (const s of data.servers) {
            const tools = (data.tools[s.name] || []).map((t: { name: string; description?: string; inputSchema: unknown }) => ({
              name: t.name,
              serverName: s.name,
              description: t.description,
              inputSchema: t.inputSchema,
            }));
            servers.push({ name: s.name, isBuiltin: false, tools });
          }
        }

        setMcpServers(servers);
      } catch (error) {
        console.error('Failed to fetch MCP tools:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMCPTools();
  }, []);

  // 获取工具的唯一标识（服务器名:工具名）
  const getToolId = (serverName: string, toolName: string) => `${serverName}:${toolName}`;

  // 检查工具是否被选中
  const isToolSelected = (serverName: string, toolName: string) => {
    return enabledTools.includes(getToolId(serverName, toolName));
  };

  // 切换工具选择
  const handleToggleTool = (serverName: string, toolName: string) => {
    toggleTool(getToolId(serverName, toolName));
  };

  // 全选/取消全选服务器的工具
  const toggleServerTools = (server: MCPServer) => {
    const allSelected = server.tools.every((t) => isToolSelected(server.name, t.name));
    if (allSelected) {
      // 取消全选
      server.tools.forEach((t) => {
        if (isToolSelected(server.name, t.name)) {
          toggleTool(getToolId(server.name, t.name));
        }
      });
    } else {
      // 全选
      server.tools.forEach((t) => {
        if (!isToolSelected(server.name, t.name)) {
          toggleTool(getToolId(server.name, t.name));
        }
      });
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="border-b px-4 py-2 bg-muted/30">
          <TabsList className="h-9">
            <TabsTrigger value="demo" className="text-base font-medium">演示</TabsTrigger>
            <TabsTrigger value="docs" className="text-base font-medium">文档</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="demo" className="flex-1 m-0 p-0 overflow-hidden">
          <div className="flex h-full overflow-hidden">
            {/* 左侧: 输入区 */}
            <div className="flex-1 flex flex-col min-w-0 border-r overflow-hidden" style={{ flexBasis: '40%', maxWidth: '40%' }}>
              {/* 工具选择 */}
              <div className="flex-shrink-0 border-b bg-muted/5 p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span>🔧</span> 可用工具
                </h3>
                {loading ? (
                  <p className="text-xs text-muted-foreground">加载中...</p>
                ) : mcpServers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">暂无可用工具</p>
                ) : (
                  <div className="space-y-3">
                    {mcpServers.map((server) => (
                      <div key={server.name} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={server.tools.every((t) => isToolSelected(server.name, t.name))}
                            onChange={() => toggleServerTools(server)}
                            className="rounded border-primary text-primary"
                          />
                          <span className="text-sm font-medium">
                            {server.name}
                            {server.isBuiltin && (
                              <Badge variant="secondary" className="ml-1 text-xs py-0">内置</Badge>
                            )}
                          </span>
                        </div>
                        <div className="pl-5 space-y-1">
                          {server.tools.map((tool) => (
                            <label key={tool.name} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                              <input
                                type="checkbox"
                                checked={isToolSelected(server.name, tool.name)}
                                onChange={() => handleToggleTool(server.name, tool.name)}
                                className="rounded border-muted-foreground/30"
                              />
                              <span className="font-mono text-xs">{tool.name}</span>
                              {tool.description && (
                                <span className="text-muted-foreground text-xs truncate">
                                  {tool.description.slice(0, 30)}
                                  {tool.description.length > 30 ? '...' : ''}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 输入面板 */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <InputPanel />
              </div>
            </div>

            {/* 右侧: 执行轨迹 */}
            <div className="flex-1 min-w-0" style={{ flexBasis: '60%' }}>
              <ExecutionTrace />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="flex-1 m-0 p-0 overflow-hidden">
          <DocsPanel modulePath="/react-agent" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
