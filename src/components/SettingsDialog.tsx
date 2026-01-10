import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Save, RotateCcw, AlertCircle } from 'lucide-react';
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
import { OllamaSettings } from '@/types/ollama';

interface SettingsDialogProps {
  settings: OllamaSettings;
  onSave: (settings: OllamaSettings) => void;
  onCheck: () => Promise<boolean>;
}

export const SettingsDialog = ({ settings, onSave, onCheck }: SettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState(settings.host);
  const [port, setPort] = useState(settings.port.toString());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleSave = () => {
    onSave({ host, port: parseInt(port) || 11434 });
    setOpen(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const tempSettings = { host, port: parseInt(port) || 11434 };
    onSave(tempSettings);
    const result = await onCheck();
    setTestResult(result);
    setTesting(false);
  };

  const handleReset = () => {
    setHost('localhost');
    setPort('11434');
    setTestResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-secondary">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            Ollama Connection
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure the connection to your local Ollama instance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="host" className="text-sm font-medium">Host</Label>
            <Input
              id="host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="localhost"
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port" className="text-sm font-medium">Port</Label>
            <Input
              id="port"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="11434"
              type="number"
              className="bg-input border-border"
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
              <span>
                Make sure Ollama is running with CORS enabled. Start with:{' '}
                <code className="font-mono text-primary">OLLAMA_ORIGINS=* ollama serve</code>
              </span>
            </p>
          </div>

          <AnimatePresence>
            {testResult !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3 rounded-lg border ${
                  testResult 
                    ? 'bg-success/10 border-success/30 text-success' 
                    : 'bg-destructive/10 border-destructive/30 text-destructive'
                }`}
              >
                <p className="text-sm font-medium">
                  {testResult ? '✓ Connection successful!' : '✕ Connection failed'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-border hover:bg-secondary"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Test'}
            </Button>
            <Button onClick={handleSave} className="glow-primary">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
