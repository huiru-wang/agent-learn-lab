'use client';

import { useState } from 'react';
import { useMCPStore, type MCPServer } from '../lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ServerPanel() {
    const {
        servers,
        connectionStatus,
        currentServerId,
        errorMessage,
        addServer,
        removeServer,
        setConnectionStatus,
        setCurrentSession,
        setTools,
        setResources,
        setPrompts,
    } = useMCPStore();

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newServer, setNewServer] = useState({ name: '', serverUrl: '', authHeader: '' });
    const [connectingServerId, setConnectingServerId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

    const handleConnect = async (server: MCPServer) => {
        // If already connected to this server, disconnect
        if (currentServerId === server.id && connectionStatus === 'connected') {
            await handleDisconnect();
            return;
        }

        setConnectingServerId(server.id);
        setConnectionStatus('connecting');
        // Clear previous error for this server
        setServerErrors((prev) => {
            const next = { ...prev };
            delete next[server.id];
            return next;
        });

        try {
            // 对于内置 MCP，直接传 name 由后端代理连接
            // 对于用户添加的 MCP，传 serverUrl
            const connectBody = server.isBuiltin
                ? { name: server.name }
                : { serverUrl: server.serverUrl, authHeader: server.authHeader };

            const response = await fetch('/api/mcp/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(connectBody),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Connection failed');
            }

            setCurrentSession(data.sessionId, server.id);
            setConnectionStatus('connected');

            // Fetch capabilities
            const [toolsRes, resourcesRes, promptsRes] = await Promise.allSettled([
                fetch('/api/agent/main/mcp/tools', {
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
            const msg = error instanceof Error ? error.message : 'Connection failed';
            setConnectionStatus('error', msg);
            setServerErrors((prev) => ({ ...prev, [server.id]: msg }));
        } finally {
            setConnectingServerId(null);
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
        setShowAddDialog(false);
    };

    const getServerStatus = (server: MCPServer): 'idle' | 'connecting' | 'connected' | 'error' => {
        if (connectingServerId === server.id) return 'connecting';
        if (currentServerId === server.id && connectionStatus === 'connected') return 'connected';
        if (serverErrors[server.id]) return 'error';
        return 'idle';
    };

    return (
        <div className="space-y-2">
            {/* Top bar: Add button + server tags */}
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 flex-shrink-0"
                    onClick={() => setShowAddDialog(true)}
                >
                    <Plus className="h-3.5 w-3.5" />
                    添加 MCP
                </Button>

                {servers.map((server) => {
                    const status = getServerStatus(server);
                    return (
                        <div key={server.id} className="group relative flex items-center">
                            <Badge
                                variant="outline"
                                className={cn(
                                    'cursor-pointer select-none pr-5 transition-colors',
                                    status === 'connected' && 'border-green-400 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 dark:border-green-700',
                                    status === 'error' && 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:border-red-700',
                                    status === 'connecting' && 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-700',
                                    status === 'idle' && 'hover:bg-muted',
                                )}
                                onClick={() => handleConnect(server)}
                                title={serverErrors[server.id] || server.serverUrl}
                            >
                                {status === 'connecting' && (
                                    <Loader2 className="h-3 w-3 animate-spin mr-0.5" />
                                )}
                                {server.name}
                            </Badge>
                            {/* Delete X button - 内置 MCP 不显示 */}
                            {!server.isBuiltin && (
                                <button
                                    className="absolute right-0.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmId(server.id);
                                    }}
                                >
                                    <X className="h-2.5 w-2.5" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Error message for current connection attempt */}
            {connectionStatus === 'error' && errorMessage && (
                <p className="text-xs text-destructive px-1">{errorMessage}</p>
            )}

            {/* Add Server Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>添加 MCP Server</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                            <Label htmlFor="server-name">名称</Label>
                            <Input
                                id="server-name"
                                value={newServer.name}
                                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="server-url">Server URL</Label>
                            <Input
                                id="server-url"
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
                        <div className="flex gap-2 pt-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>
                                取消
                            </Button>
                            <Button size="sm" onClick={handleAddServer} disabled={!newServer.name || !newServer.serverUrl}>
                                添加
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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
