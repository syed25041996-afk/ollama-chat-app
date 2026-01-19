import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { usePullModel } from '../hooks/useModels';
import { ollamaApi } from '@/lib/api/ollama';
import useSettingsStore from '@/stores/settings';
import { PullProgress } from '../types';
import { useQueryClient } from '@tanstack/react-query';

const popularModels = [
  { name: 'llama3.2', desc: 'Latest Llama model, 3B params' },
  { name: 'mistral', desc: 'Mistral 7B, fast and capable' },
  { name: 'codellama', desc: 'Code-specialized Llama' },
  { name: 'gemma2', desc: 'Google Gemma 2, efficient' },
  { name: 'phi3', desc: 'Microsoft Phi-3, small but powerful' },
];

export const PullModelDialog = () => {
  const [open, setOpen] = useState(false);
  const [modelName, setModelName] = useState('');
  const [progress, setProgress] = useState<PullProgress | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const { settings } = useSettingsStore();
  const queryClient = useQueryClient();

  const handlePull = async (name: string) => {
    const modelToPull = name || modelName;
    if (!modelToPull) return;

    setIsPulling(true);
    setProgress(null);
    try {
      for await (const progressUpdate of ollamaApi.pullModel(settings, modelToPull)) {
        setProgress(progressUpdate);
      }
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setOpen(false);
      setModelName('');
      setProgress(null);
    } catch (error) {
      console.error('Failed to pull model:', error);
    } finally {
      setIsPulling(false);
    }
  };

  const progressPercent = progress?.total && progress?.completed
    ? (progress.completed / progress.total) * 100
    : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="glow-primary">
          <Download className="h-4 w-4 mr-2" />
          Pull Model
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pull Model</DialogTitle>
          <DialogDescription>
            Download a model from the Ollama library to use for chat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="model-name">Model Name</Label>
            <Input
              id="model-name"
              placeholder="e.g., llama3.2, mistral, codellama"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              disabled={isPulling}
            />
          </div>

          <div>
            <Label>Popular Models</Label>
            <div className="grid gap-2 mt-2">
              {popularModels.map((model) => (
                <Button
                  key={model.name}
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => handlePull(model.name)}
                  disabled={isPulling}
                >
                  <div className="text-left">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.desc}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {isPulling && progress && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{progress.status}</span>
              </div>
              <Progress value={progressPercent} className="w-full" />
              <div className="text-xs text-muted-foreground text-center">
                {progressPercent.toFixed(1)}% complete
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => handlePull(modelName)}
              disabled={!modelName.trim() || isPulling}
              className="flex-1"
            >
              {isPulling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Pulling...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Pull Model
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPulling}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};