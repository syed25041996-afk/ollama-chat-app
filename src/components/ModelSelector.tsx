import { motion } from 'framer-motion';
import { ChevronDown, Bot, Trash2, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OllamaModel } from '@/types/ollama';

interface ModelSelectorProps {
  models: OllamaModel[];
  selectedModel: string | null;
  onSelect: (model: string) => void;
  onDelete: (model: string) => void;
  disabled?: boolean;
}

const formatSize = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
};

export const ModelSelector = ({
  models,
  selectedModel,
  onSelect,
  onDelete,
  disabled,
}: ModelSelectorProps) => {
  const selected = models.find((m) => m.name === selectedModel);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between bg-input border-border hover:bg-secondary"
          disabled={disabled || models.length === 0}
        >
          <span className="flex items-center gap-2 truncate">
            <Bot className="h-4 w-4 text-primary" />
            {selected?.name || 'Select a model'}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 glass border-border/50" align="start">
        {models.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No models installed. Pull a model first.
          </div>
        ) : (
          models.map((model, index) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <DropdownMenuItem
                className="flex items-center justify-between p-3 cursor-pointer group"
                onClick={() => onSelect(model.name)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{model.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {formatSize(model.size)}
                    {model.details?.parameter_size && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {model.details.parameter_size}
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(model.name);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DropdownMenuItem>
              {index < models.length - 1 && <DropdownMenuSeparator />}
            </motion.div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
