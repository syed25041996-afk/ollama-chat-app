import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, X, File, Image as ImageIcon, FileAudio, FileVideo, FileCode, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileAttachment } from '../types';

interface FileUploadProps {
  onFilesSelected: (files: FileAttachment[]) => void;
  disabled?: boolean;
  maxSize?: number; // in bytes, default 10MB
  acceptedTypes?: string[]; // e.g., ['image/*', 'text/*', 'application/pdf']
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB default
const DEFAULT_ACCEPTED_TYPES = [
  'image/*',
  'text/*',
  'application/pdf',
  'application/json',
  'application/xml',
  'text/plain',
  'text/markdown'
];

export const FileUpload = ({
  onFilesSelected,
  disabled = false,
  maxSize = MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${maxSize / (1024 * 1024)}MB limit`;
    }

    const isAcceptedType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAcceptedType) {
      return 'File type not supported';
    }

    return null;
  }, [maxSize, acceptedTypes]);

  const fileToBase64 = useCallback((file: File): Promise<string> => {
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
  }, []);

  const processFiles = useCallback(async (files: FileList) => {
    const validFiles: FileAttachment[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);

      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        continue;
      }

      try {
        const base64Content = await fileToBase64(file);
        const attachment: FileAttachment = {
          id: Date.now().toString() + i,
          name: file.name,
          type: file.type,
          size: file.size,
          content: base64Content
        };
        validFiles.push(attachment);
      } catch (error) {
        errors.push(`${file.name}: Failed to process file`);
      }
    }

    if (errors.length > 0) {
      toast({
        title: 'Some files were skipped',
        description: errors.join('\n'),
        variant: 'destructive',
      });
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
      toast({
        title: 'Files uploaded',
        description: `${validFiles.length} file(s) attached successfully.`,
      });
    }
  }, [validateFile, fileToBase64, onFilesSelected, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    e.target.value = '';
  }, [processFiles]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8" />;
    } else if (fileType.startsWith('audio/')) {
      return <FileAudio className="h-8 w-8" />;
    } else if (fileType.startsWith('video/')) {
      return <FileVideo className="h-8 w-8" />;
    } else if (fileType.includes('json') || fileType.includes('xml') || fileType.includes('javascript') || fileType.includes('typescript')) {
      return <FileCode className="h-8 w-8" />;
    } else {
      return <FileText className="h-8 w-8" />;
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <Button
        variant="outline"
        onClick={handleClick}
        disabled={disabled}
        className="w-full h-24 border-dashed border-2 hover:border-primary/50"
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">Drop files here or click to browse</span>
          <span className="text-xs text-muted-foreground">
            Supports images, documents, and text files (max {maxSize / (1024 * 1024)}MB each)
          </span>
        </div>
      </Button>
    </div>
  );
};