// Global shared types
export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

// Re-export feature-specific types for convenience
export * from '../features/chat/types';
export * from '../features/conversations/types';
export * from '../features/models/types';
export * from '../features/settings/types';
