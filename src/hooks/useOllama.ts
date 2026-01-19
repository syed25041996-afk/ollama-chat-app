import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  OllamaModel,
  OllamaSettings,
  Conversation,
  ConnectionStatus,
  ChatMessage,
  FileAttachment
} from '@/types/ollama';
import { ollamaApi } from '@/lib/api/ollama';
import { storage } from '@/lib/storage';
import useConversationsStore from '../stores/conversations';

export const useOllama = () => {
  const [settings, setSettings] = useState<OllamaSettings>(storage.getSettings);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(storage.getConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const checkConnection = useCallback(async () => {
    setConnectionStatus('checking');
    const connected = await ollamaApi.checkConnection(settings);
    setConnectionStatus(connected ? 'connected' : 'disconnected');
    return connected;
  }, [settings]);

  const fetchModels = useCallback(async () => {
    try {
      const response = await ollamaApi.listModels(settings);
      setModels(response.models || []);
    } catch (e) {
      console.error('Failed to fetch models:', e);
      setModels([]);
    }
  }, [settings]);

  useEffect(() => {
    checkConnection().then(connected => {
      if (connected) fetchModels();
    });
  }, [checkConnection, fetchModels]);

  const updateSettings = useCallback((newSettings: OllamaSettings) => {
    setSettings(newSettings);
    const saved = storage.saveSettings(newSettings);
    if (!saved) {
      console.warn('Failed to save settings to localStorage.');
    }
  }, []);

  const createConversation = useCallback((model: string) => {
    const conversation: Conversation = {
      id: uuidv4(),
      title: 'New Chat',
      model,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [conversation, ...conversations];
    setConversations(updated);
    const saved = storage.saveConversations(updated);
    if (!saved) {
      console.warn('Failed to save conversations to localStorage.');
    }
    setActiveConversationId(conversation.id);
    return conversation;
  }, [conversations]);

  const deleteConversation = useCallback((id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    const saved = storage.saveConversations(updated);
    if (!saved) {
      console.warn('Failed to save conversations to localStorage.');
    }
    if (activeConversationId === id) {
      setActiveConversationId(updated[0]?.id || null);
    }
  }, [conversations, activeConversationId]);

  const sendMessage = useCallback(async (content: string, attachments?: FileAttachment[]) => {
    if (!activeConversation || isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      attachments: attachments || []
    };
    const updatedMessages = [...activeConversation.messages, userMessage];
    
    // Update conversation with user message
    let updated = conversations.map(c =>
      c.id === activeConversation.id
        ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
        : c
    );
    setConversations(updated);
    const saved = storage.saveConversations(updated);
    if (!saved) {
      console.warn('Failed to save conversations to localStorage. Some data may be lost.');
    }

    // Start streaming response
    setIsStreaming(true);
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
        updated = conversations.map(c =>
          c.id === activeConversation.id
            ? {
                ...c,
                messages: newMessages,
                updatedAt: Date.now(),
                title: c.messages.length === 0 ? content.slice(0, 30) + '...' : c.title
              }
            : c
        );
        setConversations(updated);
      }
      const finalSaved = storage.saveConversations(updated);
      if (!finalSaved) {
        console.warn('Failed to save final conversation to localStorage.');
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Streaming error:', e);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [activeConversation, conversations, settings, isStreaming]);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const pullModel = useCallback(async (modelName: string) => {
    setIsPulling(true);
    setPullProgress('Starting download...');
    try {
      for await (const progress of ollamaApi.pullModel(settings, modelName)) {
        if (progress.completed && progress.total) {
          const percent = Math.round((progress.completed / progress.total) * 100);
          setPullProgress(`${progress.status} - ${percent}%`);
        } else {
          setPullProgress(progress.status);
        }
      }
      await fetchModels();
    } catch (e) {
      console.error('Pull error:', e);
      setPullProgress(`Error: ${(e as Error).message}`);
    } finally {
      setIsPulling(false);
    }
  }, [settings, fetchModels]);

  const deleteModel = useCallback(async (modelName: string) => {
    try {
      await ollamaApi.deleteModel(settings, modelName);
      await fetchModels();
    } catch (e) {
      console.error('Delete error:', e);
    }
  }, [settings, fetchModels]);

  return {
    settings,
    updateSettings,
    connectionStatus,
    checkConnection,
    models,
    fetchModels,
    conversations,
    activeConversation,
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
  };
};
