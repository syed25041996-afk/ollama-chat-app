import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, X, File, Image as ImageIcon, FileAudio, FileVideo, FileCode, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onFilesSelected: (files: FileAttachment[]) => void;
  disabled?: boolean;
  maxSize?: number; // in bytes, default 10MB
  acceptedTypes?: string[]; // e.g., ['image/*', 'text/*', 'application/pdf']
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string; // Base64 encoded content
  url?: string; // For uploaded files
  status?: 'uploading' | 'uploaded' | 'error';
  error?: string;
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
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (fileType.startsWith('audio/')) {
      return <FileAudio className="h-4 w-4" />;
    } else if (fileType.startsWith('video/')) {
      return <FileVideo className="h-4 w-4" />;
    } else if (fileType.includes('text') || fileType.includes('code') || fileType.includes('script')) {
      return <FileCode className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size too large. Maximum size is ${formatFileSize(maxSize)}`;
    }
    
    const allowedTypes = acceptedTypes.join(',');
    if (!file.type && !file.name.match(/\.(txt|pdf|json|xml|md)$/i)) {
      return 'File type not supported';
    }
    
    if (file.type && !acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    })) {
      return 'File type not supported';
    }
    
    return null;
  };

  const processFile = useCallback(async (file: File): Promise<FileAttachment> => {
    const error = validateFile(file);
    if (error) {
      throw new Error(error);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const attachment: FileAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          content: base64,
          status: 'uploaded'
        };
        resolve(attachment);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFiles = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const processedFiles: FileAttachment[] = [];
    
    for (const file of Array.from(selectedFiles)) {
      try {
        const attachment = await processFile(file);
        processedFiles.push(attachment);
      } catch (error) {
        const errorAttachment: FileAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          status: 'error',
          error: (error as Error).message
        };
        processedFiles.push(errorAttachment);
        
        toast({
          title: "File upload error",
          description: `${file.name}: ${(error as Error).message}`,
          variant: "destructive"
        });
      }
    }

    if (processedFiles.length > 0) {
      const newFiles = [...files, ...processedFiles];
      setFiles(newFiles);
      onFilesSelected(newFiles);
    }
    
    setUploading(false);
  }, [files, onFilesSelected, processFile, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  }, [disabled, handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (fileId: string) => {
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : disabled 
              ? 'border-border bg-muted text-muted-foreground cursor-not-allowed' 
              : 'border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm font-medium">
            Drop files here or click to upload
          </div>
          <div className="text-xs text-muted-foreground">
            Max size: {formatFileSize(maxSize)} • Supported: Images, Text, PDF, Code
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">Attachments</div>
          <div className="space-y-2">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between p-2 border rounded-md ${
                  file.status === 'error'
                    ? 'bg-destructive/10 border-destructive/50'
                    : file.status === 'uploading'
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    file.status === 'error'
                      ? 'bg-destructive/20 text-destructive-foreground'
                      : file.status === 'uploading'
                      ? 'bg-primary/20 text-primary-foreground'
                      : 'bg-accent/20 text-accent-foreground'
                  }`}>
                    {file.status === 'error' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                      {file.status === 'error' && (
                        <span className="ml-2 text-destructive">• {file.error}</span>
                      )}
                      {file.status === 'uploading' && (
                        <span className="ml-2 text-primary">• Processing...</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${
                    file.status === 'error'
                      ? 'text-destructive hover:text-destructive/80'
                      : 'text-muted-foreground hover:text-destructive'
                  }`}
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};