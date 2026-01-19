export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string; // Base64 encoded content
  url?: string; // For uploaded files
}

export interface StreamingResponse {
  model: string;
  created_at: string;
  message: ChatMessage;
  done: boolean;
}

export interface ChatParams {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
}