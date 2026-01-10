import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { EmptyState } from '@/components/EmptyState';
import { Conversation, FileAttachment } from '@/types/ollama';

interface ChatAreaProps {
  conversation: Conversation | null;
  onSend: (message: string, attachments?: FileAttachment[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  hasModel: boolean;
}

export const ChatArea = ({
  conversation,
  onSend,
  onStop,
  isStreaming,
  hasModel,
}: ChatAreaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  if (!conversation) {
    return <EmptyState />;
  }

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
                  key={index}
                  message={message}
                  isStreaming={isStreaming && index === conversation.messages.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="max-w-4xl mx-auto w-full px-4 pb-4">
        <ChatInput
          onSend={(message, attachments) => onSend(message, attachments)}
          onStop={onStop}
          isStreaming={isStreaming}
          disabled={!hasModel}
        />
      </div>
    </div>
  );
};
