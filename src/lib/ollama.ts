import {
  OllamaModelListResponse,
  ChatMessage,
  OllamaSettings,
  PullProgress
} from '@/types/ollama';

export const getBaseUrl = (settings: OllamaSettings): string => {
  return `http://${settings.host}:${settings.port}`;
};

export const ollamaApi = {
  async checkConnection(settings: OllamaSettings): Promise<boolean> {
    try {
      const response = await fetch(`${getBaseUrl(settings)}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  async listModels(settings: OllamaSettings): Promise<OllamaModelListResponse> {
    const response = await fetch(`${getBaseUrl(settings)}/api/tags`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    return response.json();
  },

  async deleteModel(settings: OllamaSettings, modelName: string): Promise<void> {
    const response = await fetch(`${getBaseUrl(settings)}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete model: ${response.statusText}`);
    }
  },

  async *pullModel(
    settings: OllamaSettings,
    modelName: string
  ): AsyncGenerator<PullProgress> {
    const response = await fetch(`${getBaseUrl(settings)}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            yield JSON.parse(line);
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  },

  async *streamChat(
    settings: OllamaSettings,
    model: string,
    messages: ChatMessage[],
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    // Process messages to include file content
    const processedMessages = messages.map(msg => {
      if (msg.attachments && msg.attachments.length > 0) {
        // Add file content to message content
        const fileDescriptions = msg.attachments.map(att =>
          `[File: ${att.name} (${att.type}, ${Math.round(att.size / 1024)} KB)]`
        ).join('\n');
        return {
          ...msg,
          content: `${msg.content}\n\n${fileDescriptions}`
        };
      }
      return msg;
    });

    const response = await fetch(`${getBaseUrl(settings)}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: processedMessages, stream: true }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              yield parsed.message.content;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  },
};
