import { ChatMessage, Model } from "../types";

const OLLAMA_BASE_URL = 'http://home.tail2b1f38.ts.net:11434/api';

export const OllamaService = {
  /**
   * Fetches the list of available models from Ollama.
   */
  getTags: async (): Promise<Model[]> => {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.models;
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  },

  /**
   * Sends a chat request to Ollama with streaming support.
   */
  chatStream: async (
    model: string,
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ) => {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: true
        })
      });

      if (!response.ok) throw new Error('Ollama API error');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Ollama sends multiple JSON objects in one chunk sometimes
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message && json.message.content) {
              onChunk(json.message.content);
            }
            if (json.done) {
              return;
            }
          } catch (e) {
            console.error('Error parsing JSON chunk', e);
          }
        }
      }
    } catch (error) {
      console.error('Chat stream error:', error);
      throw error;
    }
  }
};