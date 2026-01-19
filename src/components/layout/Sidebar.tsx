import { Bot } from "lucide-react";
import { SidebarHeader, SidebarContent } from "@/components/ui/sidebar";
import { ConversationList } from "@/features/conversations/components/ConversationList";
import { Conversation } from "@/features/conversations/types";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  disabled: boolean;
}

export function Sidebar({ conversations, activeId, onSelect, onDelete, onNew, onRename, disabled }: SidebarProps) {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Ollama GUI</h1>
            <p className="text-xs text-muted-foreground">Local AI Interface</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={onSelect}
          onDelete={onDelete}
          onNew={onNew}
          onRename={onRename}
          disabled={disabled}
        />
      </SidebarContent>
    </>
  );
}