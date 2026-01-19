import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, ChatInput, EmptyState } from './index';
import { Conversation } from '@/features/conversations/types';
import { FileAttachment } from '../types';
import { useChat } from '../hooks';

interface ChatAreaProps {
  conversation: Conversation | null;
  hasModel: boolean;
}

export const ChatArea = ({ conversation, hasModel }: ChatAreaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sendMessage, stopStreaming, isStreaming, error } = useChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  if (!conversation) {
    return <EmptyState />;
  }

  const handleSend = (message: string, attachments?: FileAttachment[]) => {
    sendMessage(message, attachments);
  };

  const handleStop = () => {
    stopStreaming();
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="max-w-4xl mx-auto w-full px-4 py-4">
          {conversation.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground"
              >
                <p>Start a conversation with <span className="text-primary font-mono">{conversation.model}</span></p>
              </motion.div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {conversation.messages.map((message, index) => (
                <ChatMessage
                  key={`${message.role}-${index}`}
                  message={message}
                  isStreaming={isStreaming && index === conversation.messages.length - 1 && message.role === 'assistant'}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="max-w-4xl mx-auto w-full px-4 pb-4">
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
          disabled={!hasModel}
          error={error}
        />
      </div>
    </div>
  );
};