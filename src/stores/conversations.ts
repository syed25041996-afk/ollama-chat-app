import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Conversation } from '../features/conversations/types';
import { storage } from '../lib/storage';

interface ConversationsState {
  conversations: Conversation[];
  activeId: string | null;
  createConversation: (model: string) => void;
  deleteConversation: (id: string) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  setActiveConversation: (id: string | null) => void;
  renameConversation: (id: string, title: string) => void;
  loadConversations: () => void;
}

const useConversationsStore = create<ConversationsState>()(
  subscribeWithSelector((set, get) => ({
    conversations: [],
    activeId: null,
    createConversation: (model: string) => {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: 'New Chat',
        model,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [newConversation, ...get().conversations];
      set({
        conversations: updated,
        activeId: newConversation.id,
      });
      storage.saveConversations(updated);
    },
    deleteConversation: (id: string) => {
      const updated = get().conversations.filter(c => c.id !== id);
      set({
        conversations: updated,
        activeId: get().activeId === id ? (updated[0]?.id || null) : get().activeId,
      });
      storage.saveConversations(updated);
    },
    updateConversation: (id: string, updates: Partial<Conversation>) => {
      const updated = get().conversations.map(c =>
        c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
      );
      set({ conversations: updated });
      storage.saveConversations(updated);
    },
    setActiveConversation: (id: string | null) => {
      set({ activeId: id });
    },
    renameConversation: (id: string, title: string) => {
      get().updateConversation(id, { title });
    },
    loadConversations: () => {
      const conversations = storage.getConversations();
      set({ conversations });
    },
  }))
);

// Load conversations on store creation
useConversationsStore.getState().loadConversations();

export default useConversationsStore;