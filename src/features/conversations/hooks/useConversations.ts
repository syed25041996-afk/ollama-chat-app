import { useCallback } from 'react';
import useConversationsStore from '../../../stores/conversations';
import { ChatMessage } from '../../chat/types';

export const useConversations = () => {
  const store = useConversationsStore();

  const generateTitleFromMessage = useCallback((content: string) => {
    const trimmed = content.trim();
    return trimmed.length > 30 ? trimmed.slice(0, 30) + '...' : trimmed || 'New Chat';
  }, []);

  const addMessageToConversation = useCallback((id: string, message: ChatMessage) => {
    const conversation = store.conversations.find(c => c.id === id);
    if (!conversation) return;

    const newMessages = [...conversation.messages, message];
    const title = conversation.messages.length === 0 ? generateTitleFromMessage(message.content) : conversation.title;

    store.updateConversation(id, { messages: newMessages, title });
  }, [store, generateTitleFromMessage]);

  return {
    ...store,
    addMessageToConversation,
    generateTitleFromMessage,
  };
};