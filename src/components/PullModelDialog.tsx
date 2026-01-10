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

interface PullModelDialogProps {
  onPull: (modelName: string) => void;
  isPulling: boolean;
  progress: string;
}

const popularModels = [
  { name: 'llama3.2', desc: 'Latest Llama model, 3B params' },
  { name: 'mistral', desc: 'Mistral 7B, fast and capable' },
  { name: 'codellama', desc: 'Code-specialized Llama' },
  { name: 'gemma2', desc: 'Google Gemma 2, efficient' },
  { name: 'phi3', desc: 'Microsoft Phi-3, small but powerful' },
];

export const PullModelDialog = ({ onPull, isPulling, progress }: PullModelDialogProps) => {
  const [open, setOpen] = useState(false);
  const [modelName, setModelName] = useState('');

  const handlePull = (name: string) => {
    onPull(name || modelName);
    if (!isPulling) setModelName('');
  };

  // Parse progress for percentage
  const progressMatch = progress.match(/(\d+)%/);
  const progressPercent = progressMatch ? parseInt(progressMatch[1]) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="glow-primary">
          <Download className="h-4 w-4 mr-2" />
          Pull Model
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Download className="h-5 w-5 text-primary" />
            Pull New Model
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Download a model from the Ollama library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="model-name" className="text-sm font-medium">Model Name</Label>
            <div className="flex gap-2">
              <Input
                id="model-name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g., llama3.2, mistral:7b"
                className="bg-input border-border"
                disabled={isPulling}
              />
              <Button
                onClick={() => handlePull(modelName)}
                disabled={!modelName || isPulling}
                className="glow-primary shrink-0"
              >
                {isPulling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pull'}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {isPulling && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Progress value={progressPercent} className="h-2" />
                <p className="text-xs text-muted-foreground font-mono">{progress}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">Popular Models</Label>
              <a
                href="https://ollama.com/library"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Browse all <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="grid gap-2">
              {popularModels.map((model, index) => (
                <motion.button
                  key={model.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handlePull(model.name)}
                  disabled={isPulling}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors text-left disabled:opacity-50"
                >
                  <div>
                    <p className="font-medium text-sm">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.desc}</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
