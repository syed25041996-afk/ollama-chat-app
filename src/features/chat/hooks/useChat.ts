import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, FileAttachment, StreamingResponse } from '../types';
import { ollamaApi } from '@/lib/api/ollama';
import useConversationsStore from '@/stores/conversations';
import useSettingsStore from '@/stores/settings';

export interface UseChatReturn {
  sendMessage: (content: string, attachments?: FileAttachment[]) => Promise<void>;
  stopStreaming: () => void;
  isStreaming: boolean;
  error: string | null;
  clearError: () => void;
}

export const useChat = (): UseChatReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { conversations, activeId, updateConversation } = useConversationsStore();
  const { settings } = useSettingsStore();

  const activeConversation = conversations.find(c => c.id === activeId) || null;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async (content: string, attachments?: FileAttachment[]) => {
    if (!activeConversation || isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      attachments: attachments || []
    };

    const updatedMessages = [...activeConversation.messages, userMessage];

    // Update conversation with user message immediately
    updateConversation(activeConversation.id, {
      messages: updatedMessages,
      updatedAt: Date.now(),
      title: activeConversation.messages.length === 0 ? content.slice(0, 30) + '...' : activeConversation.title
    });

    // Start streaming response
    setIsStreaming(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
    let fullContent = '';

    try {
      for await (const chunk of ollamaApi.streamChat(
        settings,
        activeConversation.model,
        updatedMessages,
        abortControllerRef.current.signal
      )) {
        fullContent += chunk;
        const newMessages = [...updatedMessages, { ...assistantMessage, content: fullContent }];
        updateConversation(activeConversation.id, {
          messages: newMessages,
          updatedAt: Date.now()
        });
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        // Streaming was stopped, this is expected
        return;
      }

      const errorMessage = e instanceof Error ? e.message : 'An error occurred while streaming';
      setError(errorMessage);
      console.error('Chat streaming error:', e);

      // Add error message to conversation
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${errorMessage}`
      };
      const errorMessages = [...updatedMessages, errorChatMessage];
      updateConversation(activeConversation.id, {
        messages: errorMessages,
        updatedAt: Date.now()
      });
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [activeConversation, isStreaming, settings, updateConversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    sendMessage,
    stopStreaming,
    isStreaming,
    error,
    clearError
  };
};