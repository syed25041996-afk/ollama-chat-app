import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Menu, X, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOllama } from "@/hooks/useOllama";
import { useResponsiveSidebar } from "@/hooks/useResponsiveSidebar";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ModelSelector } from "@/components/ModelSelector";
import { PullModelDialog } from "@/components/PullModelDialog";
import { ConversationList } from "@/components/ConversationList";
import { ChatArea } from "@/components/ChatArea";

const Index = () => {
  const { isMobile, sidebarOpen, toggleSidebar, closeSidebar, shouldShowSidebar } = useResponsiveSidebar();
  const [showConnectionError, setShowConnectionError] = useState(false);
  const { settings, updateSettings, connectionStatus, checkConnection, models, fetchModels, conversations, activeConversation, activeConversationId, setActiveConversationId, createConversation, deleteConversation, sendMessage, isStreaming, stopStreaming, pullModel, deleteModel, isPulling, pullProgress } = useOllama();

  // Show connection error after a delay if still disconnected
  useEffect(() => {
    if (connectionStatus === "disconnected") {
      const timer = setTimeout(() => setShowConnectionError(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowConnectionError(false);
    }
  }, [connectionStatus]);

  const handleNewChat = () => {
    if (models.length > 0) {
      createConversation(models[0].name);
    }
  };

  const handleModelSelect = (modelName: string) => {
    if (!activeConversation) {
      createConversation(modelName);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false} 
        animate={{ width: shouldShowSidebar ? 280 : 0, opacity: shouldShowSidebar ? 1 : 0 }} 
        transition={{ duration: 0.2, ease: "easeInOut" }} 
        className="h-full border-r border-border bg-sidebar overflow-hidden lg:block fixed lg:static z-50 lg:z-auto"
      >
        <div className="w-[280px] h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Ollama GUI</h1>
              <p className="text-xs text-muted-foreground">Local AI Interface</p>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-hidden">
            <ConversationList 
              conversations={conversations} 
              activeId={activeConversationId} 
              onSelect={setActiveConversationId} 
              onDelete={deleteConversation} 
              onNew={handleNewChat} 
            />
          </div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={closeSidebar} 
        />
      )}

      {/* Main Content */}
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
                models={models} 
                selectedModel={activeConversation?.model || null} 
                onSelect={handleModelSelect} 
                onDelete={deleteModel} 
                disabled={isStreaming} 
              />
            </div>

            {/* Mobile New Chat Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNewChat} 
              className="lg:hidden flex items-center gap-2" 
              disabled={models.length === 0}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={fetchModels} 
              className="hover:bg-secondary" 
              disabled={connectionStatus !== "connected"}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <PullModelDialog onPull={pullModel} isPulling={isPulling} progress={pullProgress} />
            <ConnectionStatus status={connectionStatus} onRefresh={checkConnection} />
            <SettingsDialog settings={settings} onSave={updateSettings} onCheck={checkConnection} />
          </div>
        </header>

        {/* Mobile Model Selector */}
        <div className="sm:hidden p-3 border-b border-border bg-card/30 sticky top-16 z-10">
          <ModelSelector 
            models={models} 
            selectedModel={activeConversation?.model || null} 
            onSelect={handleModelSelect} 
            onDelete={deleteModel} 
            disabled={isStreaming} 
          />
        </div>

        {/* Chat Area */}
        <main className="flex-1 overflow-hidden">
          <ChatArea 
            conversation={activeConversation} 
            onSend={sendMessage} 
            onStop={stopStreaming} 
            isStreaming={isStreaming} 
            hasModel={!!activeConversation?.model} 
          />
        </main>
      </div>

      {/* Connection Error Overlay */}
      {showConnectionError && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            className="max-w-md w-full p-6 rounded-2xl glass border-destructive/30 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Connection Failed</h2>
            <p className="text-muted-foreground mb-4">
              Unable to connect to Ollama at{" "}
              <code className="text-primary font-mono text-sm">
                http://{settings.host}:{settings.port}
              </code>
            </p>
            <div className="space-y-3 text-left text-sm mb-6 p-4 rounded-lg bg-muted/30">
              <p className="font-medium">Make sure to:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>
                  Install Ollama from{" "}
                  <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    ollama.com
                  </a>
                </li>
                <li>
                  Start Ollama with CORS enabled:
                  <code className="block mt-1 p-2 rounded bg-background font-mono text-xs">OLLAMA_ORIGINS=* ollama serve</code>
                </li>
                <li>Check your firewall settings</li>
              </ol>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  checkConnection();
                  setShowConnectionError(false);
                }}
                className="glow-primary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
              <Button variant="outline" onClick={() => setShowConnectionError(false)}>
                Dismiss
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
