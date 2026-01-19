import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Square, Sparkles, Paperclip, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileAttachment } from '../types';
import { useFileAttachments } from '../hooks';

interface ChatInputProps {
  onSend: (message: string, attachments?: FileAttachment[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
  error?: string | null;
}

export const ChatInput = ({ onSend, onStop, isStreaming, disabled, error }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    attachments,
    addAttachment,
    removeAttachment,
    clearAttachments,
    isUploading
  } = useFileAttachments();

  const handleSend = () => {
    if (input.trim() && !disabled && !isStreaming && !isUploading) {
      onSend(input.trim(), attachments);
      setInput('');
      clearAttachments();
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => addAttachment(file));
    }
    // Reset input
    e.target.value = '';
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File Attachments Display */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">Attachments ({attachments.length})</div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2 bg-accent/20 border border-border rounded-md px-3 py-2"
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{attachment.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-destructive/20"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isUploading ? "Uploading files..." : "Type your message..."}
            disabled={disabled || isUploading}
            className="min-h-[44px] max-h-[200px] resize-none pr-12"
            rows={1}
          />

          {/* File Upload Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 h-8 w-8"
            onClick={handleFileButtonClick}
            disabled={disabled || isUploading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,text/*,application/pdf,application/json,application/xml,text/plain,text/markdown"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Send/Stop Button */}
        <Button
          onClick={isStreaming ? onStop : handleSend}
          disabled={disabled || (!input.trim() && !isStreaming) || isUploading}
          size="icon"
          className="h-11 w-11 shrink-0"
        >
          {isStreaming ? (
            <Square className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Loading Indicator */}
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <motion.div
            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          Uploading files...
        </div>
      )}
    </div>
  );
};