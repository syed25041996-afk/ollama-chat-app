export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaModelListResponse {
  models: OllamaModel[];
}

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

export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface OllamaSettings {
  host: string;
  port: number;
}

export interface StreamingResponse {
  model: string;
  created_at: string;
  message: ChatMessage;
  done: boolean;
}

export interface PullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';
