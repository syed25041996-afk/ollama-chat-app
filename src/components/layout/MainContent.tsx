import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ModelSelector } from "@/features/models/components/ModelSelector";
import { ConnectionStatusComponent } from "@/features/models/components/ConnectionStatus";
import { PullModelDialog } from "@/features/models/components/PullModelDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ChatArea } from "@/features/chat/components";
import { OllamaModel, ConnectionStatus, OllamaSettings, Conversation } from "@/types/ollama";

interface MainContentProps {
  isMobile: boolean;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  models: OllamaModel[];
  activeConversation: Conversation | null;
  connectionStatus: ConnectionStatus;
  settings: OllamaSettings;
  updateSettings: (settings: OllamaSettings) => void;
  checkConnection: () => Promise<boolean>;
  pullModel: (name: string) => void;
  deleteModel: (name: string) => void;
  isPulling: boolean;
  pullProgress: string;
  sendMessage: (message: string) => void;
  isStreaming: boolean;
  stopStreaming: () => void;
  showConnectionError: boolean;
  onModelSelect: (model: string) => void;
}

export function MainContent({
  isMobile,
  sidebarOpen,
  toggleSidebar,
  models,
  activeConversation,
  connectionStatus,
  settings,
  updateSettings,
  checkConnection,
  pullModel,
  deleteModel,
  isPulling,
  pullProgress,
  sendMessage,
  isStreaming,
  stopStreaming,
  showConnectionError,
  onModelSelect,
}: MainContentProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-4 gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-secondary lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="hidden sm:block w-64">
           <ModelSelector
             selectedModel={activeConversation?.model || null}
             onSelect={onModelSelect}
             disabled={connectionStatus !== "connected"}
           />
         </div>
        </div>

        <div className="flex items-center gap-2">
           <ConnectionStatusComponent />
           <PullModelDialog />
           <SettingsDialog
             settings={settings}
             onSave={updateSettings}
             onCheck={checkConnection}
           />
         </div>
      </header>

      {/* Chat Area */}
      <ChatArea
        conversation={activeConversation}
        hasModel={connectionStatus === "connected" && models.length > 0}
      />

      {/* Connection Error Overlay */}
      {showConnectionError && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Connection Lost</h2>
            <p className="text-muted-foreground mb-4">
              Unable to connect to Ollama. Please check your settings and try again.
            </p>
            <Button onClick={checkConnection}>Retry Connection</Button>
          </div>
        </div>
      )}
    </div>
  );
}