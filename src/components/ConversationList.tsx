import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/types/ollama';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNew,
}: ConversationListProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNew}
          className="w-full justify-start gap-2 glow-primary"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="p-2 space-y-1">
          <AnimatePresence mode="popLayout">
            {conversations.map((conv, index) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.02 }}
                layout
              >
                <button
                  onClick={() => onSelect(conv.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group ${
                    activeId === conv.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-secondary/50 border border-transparent'
                  }`}
                >
                  <MessageSquare
                    className={`h-4 w-4 shrink-0 ${
                      activeId === conv.id ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.model}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {conversations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
