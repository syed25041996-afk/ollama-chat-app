export interface Model {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[]; // Base64 strings
}

export interface Attachment {
  type: 'image' | 'file';
  base64: string;
  name: string;
}

export interface ChatSession {
    id: string;
    messages: ChatMessage[];
    model: string;
}