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
import { useListModels, useDeleteModel } from '../hooks/useModels';
import { OllamaModel } from '../types';

interface ModelSelectorProps {
  selectedModel: string | null;
  onSelect: (model: string) => void;
  disabled?: boolean;
}

const formatSize = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
};

export const ModelSelector = ({
  selectedModel,
  onSelect,
  disabled,
}: ModelSelectorProps) => {
  const { data: modelList, isLoading, error } = useListModels();
  const deleteModelMutation = useDeleteModel();

  const models = modelList?.models || [];
  const selected = models.find((m) => m.name === selectedModel);

  const handleDelete = async (modelName: string) => {
    if (confirm(`Are you sure you want to delete the model "${modelName}"?`)) {
      try {
        await deleteModelMutation.mutateAsync(modelName);
      } catch (error) {
        console.error('Failed to delete model:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <span className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Loading models...
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <span className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-destructive" />
          Error loading models
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

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
      <DropdownMenuContent className="w-full min-w-[300px] max-h-[300px] overflow-y-auto">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.name}
            onClick={() => onSelect(model.name)}
            className="flex items-center justify-between p-3 cursor-pointer"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Bot className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{model.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <HardDrive className="h-3 w-3" />
                  {formatSize(model.size)}
                  <span>•</span>
                  {model.details?.family || 'Unknown'}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(model.name);
              }}
              disabled={deleteModelMutation.isPending}
              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </DropdownMenuItem>
        ))}
        {models.length === 0 && (
          <DropdownMenuItem disabled className="text-center text-muted-foreground">
            No models available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};