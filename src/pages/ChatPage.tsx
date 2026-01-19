import { useEffect, useState } from "react";
import { useResponsiveSidebar } from "@/hooks/useResponsiveSidebar";
import { useOllama } from "@/hooks/useOllama";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";

const ChatPage = () => {
  const { isMobile, sidebarOpen, toggleSidebar, closeSidebar } = useResponsiveSidebar();
  const [showConnectionError, setShowConnectionError] = useState(false);
  const {
    settings,
    updateSettings,
    connectionStatus,
    checkConnection,
    models,
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    deleteConversation,
    sendMessage,
    isStreaming,
    stopStreaming,
    pullModel,
    deleteModel,
    isPulling,
    pullProgress,
  } = useOllama();

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

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
      closeSidebar();
    }
  };

  return (
    <AppLayout
      sidebar={
        <Sidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={setActiveConversationId}
          onDelete={deleteConversation}
          onNew={handleNewChat}
          disabled={models.length === 0}
        />
      }
      main={
        <MainContent
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          models={models}
          activeConversation={activeConversation}
          connectionStatus={connectionStatus}
          settings={settings}
          updateSettings={updateSettings}
          checkConnection={checkConnection}
          pullModel={pullModel}
          deleteModel={deleteModel}
          isPulling={isPulling}
          pullProgress={pullProgress}
          sendMessage={sendMessage}
          isStreaming={isStreaming}
          stopStreaming={stopStreaming}
          showConnectionError={showConnectionError}
        />
      }
    />
  );
};

export default ChatPage;