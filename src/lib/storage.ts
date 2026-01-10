import { Conversation, OllamaSettings } from '@/types/ollama';

const STORAGE_KEYS = {
  SETTINGS: 'ollama-settings',
  CONVERSATIONS: 'ollama-conversations',
} as const;

const DEFAULT_SETTINGS: OllamaSettings = {
  host: 'localhost',
  port: 11434,
};

// Maximum number of conversations to keep
const MAX_CONVERSATIONS = 50;
// Maximum messages per conversation
const MAX_MESSAGES_PER_CONVERSATION = 100;

// Helper function to safely save to localStorage with error handling
function safeSave(key: string, data: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded. Attempting to free up space...');
      
      // Try to clear some space by removing oldest conversations
      try {
        const conversations = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || '[]');
        if (Array.isArray(conversations) && conversations.length > 0) {
          // Remove oldest 20% of conversations
          const toRemove = Math.ceil(conversations.length * 0.2);
          const filtered = conversations.slice(toRemove);
          localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));
          
          // Try saving again
          localStorage.setItem(key, JSON.stringify(data));
          return true;
        }
      } catch (clearError) {
        console.error('Failed to clear space:', clearError);
      }
    }
    
    console.error('Failed to save to localStorage:', e);
    return false;
  }
}

// Helper function to truncate conversation messages
function truncateConversation(conversation: Conversation): Conversation {
  if (conversation.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
    return {
      ...conversation,
      messages: conversation.messages.slice(-MAX_MESSAGES_PER_CONVERSATION)
    };
  }
  return conversation;
}

export const storage = {
  getSettings(): OllamaSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: OllamaSettings): boolean {
    return safeSave(STORAGE_KEYS.SETTINGS, settings);
  },

  getConversations(): Conversation[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (stored) {
        const conversations = JSON.parse(stored);
        if (Array.isArray(conversations)) {
          // Truncate messages in each conversation and limit total conversations
          const truncated = conversations
            .map(truncateConversation)
            .slice(0, MAX_CONVERSATIONS);
          
          // If we truncated, save the cleaned version
          if (truncated.length !== conversations.length) {
            this.saveConversations(truncated);
          }
          
          return truncated;
        }
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }
    return [];
  },

  saveConversations(conversations: Conversation[]): boolean {
    // Truncate messages in each conversation and limit total conversations
    const truncated = conversations
      .map(truncateConversation)
      .slice(0, MAX_CONVERSATIONS);
    
    return safeSave(STORAGE_KEYS.CONVERSATIONS, truncated);
  },

  addConversation(conversation: Conversation): boolean {
    const conversations = this.getConversations();
    const truncatedConversation = truncateConversation(conversation);
    conversations.unshift(truncatedConversation);
    return this.saveConversations(conversations);
  },

  updateConversation(conversation: Conversation): boolean {
    const conversations = this.getConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);
    if (index !== -1) {
      const truncatedConversation = truncateConversation(conversation);
      conversations[index] = truncatedConversation;
      return this.saveConversations(conversations);
    }
    return false;
  },

  deleteConversation(id: string): boolean {
    const conversations = this.getConversations();
    const filtered = conversations.filter(c => c.id !== id);
    return this.saveConversations(filtered);
  },

  // Clear all conversations (useful for manual cleanup)
  clearConversations(): boolean {
    return safeSave(STORAGE_KEYS.CONVERSATIONS, []);
  },

  // Get storage usage information
  getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      const conversations = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || '';
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS) || '';
      const used = conversations.length + settings.length;
      
      // Estimate total available space (browser dependent, typically 5-10MB)
      // We'll use 5MB as a conservative estimate
      const total = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = Math.round((used / total) * 100);
      
      return { used, total, percentage };
    } catch (e) {
      return { used: 0, total: 0, percentage: 0 };
    }
  },
};
