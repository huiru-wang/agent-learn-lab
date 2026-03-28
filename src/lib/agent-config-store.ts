import { create } from 'zustand';

export interface ModelInfo {
    id: string;
    name: string;
    provider: string;
    model: string;
}

export interface AgentConfig {
    agent: { name: string; description: string };
    models: ModelInfo[];
    localTools: string[];
    mcps: Record<string, {
        name: string;
        serverUrl?: string;
        authHeader?: string;
        tools: string[];
    }>;
}

interface AgentConfigState {
    config: AgentConfig | null;
    loading: boolean;
    error: string | null;
    fetchConfig: () => Promise<void>;
}

export const useAgentConfigStore = create<AgentConfigState>((set, get) => ({
    config: null,
    loading: false,
    error: null,
    fetchConfig: async () => {
        if (get().config) return; // Already loaded
        set({ loading: true, error: null });
        try {
            const res = await fetch('/api/agent/main/config');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            set({ config: data, loading: false });
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to load config';
            set({ error: msg, loading: false });
        }
    },
}));
