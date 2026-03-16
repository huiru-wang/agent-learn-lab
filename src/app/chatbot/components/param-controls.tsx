'use client';

import { useEffect } from 'react';
import { useChatStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

export function ParamControls() {
  const { modelParams, setModelParams, availableModels, modelsLoaded, setAvailableModels } = useChatStore();

  useEffect(() => {
    if (!modelsLoaded) {
      fetch('/api/models')
        .then((res) => res.json())
        .then((data) => {
          if (data.models) {
            setAvailableModels(data.models);
          }
        })
        .catch(console.error);
    }
  }, [modelsLoaded, setAvailableModels]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">模型参数</CardTitle>
        <p className="text-xs text-muted-foreground">
          调整参数观察对输出的影响
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">模型</Label>
          {!modelsLoaded ? (
            <div className="flex items-center gap-2 h-8 px-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              加载模型列表...
            </div>
          ) : (
            <Select
              value={modelParams.model}
              onValueChange={(value) => setModelParams({ model: value ?? '' })}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Temperature</Label>
            <span className="text-xs text-muted-foreground font-mono">
              {modelParams.temperature.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[modelParams.temperature]}
            onValueChange={(values) => {
              const v = Array.isArray(values) ? values[0] : values;
              setModelParams({ temperature: v });
            }}
            min={0}
            max={2}
            step={0.01}
            className="py-2"
          />
          <p className="text-xs text-muted-foreground">
            较低值输出更确定，较高值输出更随机
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Max Tokens</Label>
            <span className="text-xs text-muted-foreground font-mono">
              {modelParams.maxTokens}
            </span>
          </div>
          <Slider
            value={[modelParams.maxTokens]}
            onValueChange={(values) => {
              const v = Array.isArray(values) ? values[0] : values;
              setModelParams({ maxTokens: v });
            }}
            min={64}
            max={4096}
            step={64}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Top P</Label>
            <span className="text-xs text-muted-foreground font-mono">
              {modelParams.topP.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[modelParams.topP]}
            onValueChange={(values) => {
              const v = Array.isArray(values) ? values[0] : values;
              setModelParams({ topP: v });
            }}
            min={0}
            max={1}
            step={0.01}
            className="py-2"
          />
          <p className="text-xs text-muted-foreground">
            核采样参数，与 temperature 二选一
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">流式输出</Label>
            <p className="text-xs text-muted-foreground">Stream</p>
          </div>
          <Switch
            checked={modelParams.stream}
            onCheckedChange={(checked) => setModelParams({ stream: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
