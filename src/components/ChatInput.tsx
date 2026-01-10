import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Square, Sparkles, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload, FileAttachment } from './FileUpload';

interface ChatInputProps {
  onSend: (message: string, attachments?: FileAttachment[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

export const ChatInput = ({ onSend, onStop, isStreaming, disabled }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled && !isStreaming) {
      onSend(input.trim(), attachments);
      setInput('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleFilesSelected = (selectedFiles: FileAttachment[]) => {
    setAttachments(selectedFiles);
  };

  return (
    <div className="p-4 border-t border-border bg-card/50">
      {/* File Upload Section */}
      {attachments.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-muted-foreground font-medium mb-2">Attachments</div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 bg-accent/20 border border-border rounded-md px-2 py-1 text-xs"
              >
                <Paperclip className="h-3 w-3 text-muted-foreground" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <span className="text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Select a model to start chatting...' : attachments.length > 0 ? 'Type your message (with attachments)...' : 'Type your message...'}
          disabled={disabled}
          className="min-h-[56px] max-h-[200px] pr-24 resize-none bg-input border-border focus:ring-primary/50 placeholder:text-muted-foreground"
          rows={1}
        />
        <div className="absolute right-2 bottom-2 flex gap-2">
          {!isStreaming && (
            <Button
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.multiple = true;
                fileInput.accept = 'image/*,text/*,application/pdf,application/json,application/xml,text/plain,text/markdown';
                fileInput.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) {
                    // Process files and add to attachments
                    const newAttachments: FileAttachment[] = [];
                    Array.from(files).forEach(file => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        newAttachments.push({
                          id: Math.random().toString(36).substr(2, 9),
                          name: file.name,
                          type: file.type || 'application/octet-stream',
                          size: file.size,
                          content: base64
                        });
                        setAttachments(prev => [...prev, ...newAttachments]);
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                };
                fileInput.click();
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          )}
          {isStreaming ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Button
                onClick={onStop}
                variant="destructive"
                size="icon"
                className="h-8 w-8"
              >
                <Square className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              size="icon"
              className="h-8 w-8 glow-primary disabled:opacity-50 disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};
