import { motion } from 'framer-motion';
import { User, Bot, Copy, Check, Paperclip, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { ChatMessage as Message, FileAttachment } from '@/types/ollama';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage = ({ message, isStreaming }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Eye className="h-4 w-4" />;
    } else if (fileType.startsWith('audio/')) {
      return <Eye className="h-4 w-4" />;
    } else if (fileType.startsWith('video/')) {
      return <Eye className="h-4 w-4" />;
    } else {
      return <Download className="h-4 w-4" />;
    }
  };

  const handleDownloadFile = (attachment: FileAttachment) => {
    if (attachment.content) {
      const link = document.createElement('a');
      const mimeType = attachment.type || 'application/octet-stream';
      link.href = `data:${mimeType};base64,${attachment.content}`;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 p-4 ${isUser ? 'bg-transparent' : 'bg-card/50'}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? 'bg-primary/20 text-primary'
            : 'bg-accent/20 text-accent-foreground'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {!isUser && message.content && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-secondary"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        <div className={`prose prose-invert max-w-none ${!isUser ? 'font-mono text-sm' : ''}`}>
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
            {isStreaming && !isUser && (
              <motion.span
                className="inline-block w-2 h-4 bg-primary ml-1"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </p>
        </div>

        {/* File Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-muted-foreground font-medium">Attachments</div>
            <div className="space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 bg-accent/20 border border-border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                      {getFileIcon(attachment.type)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{attachment.name}</div>
                      <div className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {attachment.type.startsWith('image/') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const img = new Image();
                          img.src = `data:${attachment.type};base64,${attachment.content}`;
                          const w = window.open('');
                          w?.document.write(img.outerHTML);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownloadFile(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
