import { useState, useCallback } from 'react';
import { FileAttachment } from '../types';
import { useToast } from '@/components/ui/use-toast';

export interface UseFileAttachmentsReturn {
  attachments: FileAttachment[];
  addAttachment: (file: File) => Promise<void>;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  isUploading: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  'image/*',
  'text/*',
  'application/pdf',
  'application/json',
  'application/xml',
  'text/plain',
  'text/markdown'
];

export const useFileAttachments = (): UseFileAttachmentsReturn => {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
    }

    const isAcceptedType = ACCEPTED_TYPES.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAcceptedType) {
      return 'File type not supported';
    }

    return null;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const addAttachment = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'File validation error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const base64Content = await fileToBase64(file);

      const attachment: FileAttachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        content: base64Content
      };

      setAttachments(prev => [...prev, attachment]);

      toast({
        title: 'File uploaded',
        description: `${file.name} has been attached to your message.`,
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload the file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  return {
    attachments,
    addAttachment,
    removeAttachment,
    clearAttachments,
    isUploading
  };
};