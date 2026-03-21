'use client';

import { useState } from 'react';
import { useMCPStore, type MCPServer } from '../lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronDown, Plus, Trash2, Wifi, WifiOff, Loader2 } from 'lucide-react';

export function ServerPanel() {
  const {
    servers,
    connectionStatus,
    currentServerId,
    addServer,
    removeServer,
    setConnectionStatus,
    setCurrentSession,
    setTools,
    setResources,
    setPrompts,
  } = useMCPStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newServer, setNewServer] = useState({ name: '', serverUrl: '', authHeader: '' });
  const [isConnecting, setIsConnecting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const connectedServer = servers.find((s) => s.id === currentServerId);

  const handleConnect = async (server: MCPServer) => {
    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      const response = await fetch('/api/mcp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverUrl: server.serverUrl,
          authHeader: server.authHeader,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Connection failed');
      }

      setCurrentSession(data.sessionId, server.id);
      setConnectionStatus('connected');

      // Fetch capabilities
      const [toolsRes, resourcesRes, promptsRes] = await Promise.allSettled([
        fetch('/api/mcp/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: data.sessionId, method: 'listTools' }),
        }),
        fetch('/api/mcp/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: data.sessionId, method: 'listResources' }),
        }),
        fetch('/api/mcp/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: data.sessionId, method: 'listPrompts' }),
        }),
      ]);

      if (toolsRes.status === 'fulfilled' && toolsRes.value.ok) {
        const toolsData = await toolsRes.value.json();
        setTools(toolsData.tools || []);
      }

      if (resourcesRes.status === 'fulfilled' && resourcesRes.value.ok) {
        const resourcesData = await resourcesRes.value.json();
        setResources(resourcesData.resources || []);
      }

      if (promptsRes.status === 'fulfilled' && promptsRes.value.ok) {
        const promptsData = await promptsRes.value.json();
        setPrompts(promptsData.prompts || []);
      }
    } catch (error) {
      setConnectionStatus('error', error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const sessionId = useMCPStore.getState().currentSessionId;
    if (!sessionId) return;

    try {
      await fetch('/api/mcp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    } catch {
      // Ignore disconnect errors
    }

    setCurrentSession(null, null);
    setConnectionStatus('disconnected');
  };

  const handleAddServer = () => {
    if (!newServer.name || !newServer.serverUrl) return;

    addServer({
      name: newServer.name,
      serverUrl: newServer.serverUrl,
      authHeader: newServer.authHeader || undefined,
    });

    setNewServer({ name: '', serverUrl: '', authHeader: '' });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-3">
      {/* Server selector / status */}
      <div className="flex items-center gap-2">
        {connectionStatus === 'connected' && connectedServer ? (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 flex-1">{connectedServer.name}</span>
            <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-green-600 hover:text-green-700 hover:bg-green-100">
              断开
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="flex-1">
              <Button variant="outline" className="justify-between">
                {connectedServer ? connectedServer.name : '选择 Server'}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {servers.length === 0 ? (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  暂无已保存的 Server
                </DropdownMenuItem>
              ) : (
                servers.map((server) => (
                  <DropdownMenuItem
                    key={server.id}
                    onClick={() => handleConnect(server)}
                    disabled={isConnecting}
                    className="flex items-center justify-between"
                  >
                    <span>{server.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(server.id);
                      }}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAddForm(true)} className="text-primary">
                <Plus className="h-4 w-4 mr-2" />
                添加 Server
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {connectionStatus === 'connecting' && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {connectionStatus === 'error' && (
          <WifiOff className="h-4 w-4 text-destructive" />
        )}
      </div>

      {/* Error message */}
      {connectionStatus === 'error' && (
        <div className="text-sm text-destructive px-2">
          {useMCPStore.getState().errorMessage}
        </div>
      )}

      {/* Empty state */}
      {servers.length === 0 && !showAddForm && (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">暂无已连接的 MCP Server</p>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              添加 Server
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Server form */}
      {showAddForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">添加 MCP Server</CardTitle>
            <CardDescription>填写 Server 连接信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="server-name">名称</Label>
              <Input
                id="server-name"
                placeholder="例如：高德地图"
                value={newServer.name}
                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="server-url">Server URL</Label>
              <Input
                id="server-url"
                placeholder="https://mcp.example.com/mcp"
                value={newServer.serverUrl}
                onChange={(e) => setNewServer({ ...newServer, serverUrl: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="server-auth">认证 Header（可选）</Label>
              <Input
                id="server-auth"
                placeholder="Bearer your-token-here"
                value={newServer.authHeader}
                onChange={(e) => setNewServer({ ...newServer, authHeader: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleAddServer} disabled={!newServer.name || !newServer.serverUrl}>
                连接
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除 Server</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个 Server 配置吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  removeServer(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
