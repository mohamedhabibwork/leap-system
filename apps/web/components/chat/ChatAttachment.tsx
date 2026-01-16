'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useUnifiedFileUpload } from '@/components/upload/unified-file-upload';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Paperclip, Image, FileText, X, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentPreview {
  file: File;
  preview?: string;
  type: 'image' | 'file';
}

interface ChatAttachmentProps {
  onAttach: (url: string, type: 'image' | 'file') => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
];

export function ChatAttachment({ onAttach, disabled }: ChatAttachmentProps) {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<AttachmentPreview | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { upload, isUploading, progress, error } = useUnifiedFileUpload({
    folder: 'chat-attachments',
    maxSize: MAX_FILE_SIZE,
    accept: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_FILE_TYPES],
    onSuccess: (response) => {
      // Call onAttach with the uploaded URL
      onAttach(response.url, preview?.type || 'file');
      
      // Reset state
      setTimeout(() => {
        setPreview(null);
        setIsOpen(false);
      }, 500);
    },
    onError: (err) => {
      // Error is handled by the hook
    },
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (validation will also happen in unified upload hook)
    if (file.size > MAX_FILE_SIZE) {
      // Error will be shown by unified upload hook
      return;
    }

    // Validate file type (validation will also happen in unified upload hook)
    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : [...ALLOWED_IMAGE_TYPES, ...ALLOWED_FILE_TYPES];
    if (!allowedTypes.includes(file.type)) {
      // Error will be shown by unified upload hook
      return;
    }

    // Create preview for images
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview({
          file,
          preview: reader.result as string,
          type: 'image',
        });
      };
      reader.readAsDataURL(file);
    } else {
      setPreview({
        file,
        type: 'file',
      });
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!preview) return;

    try {
      await upload(preview.file);
    } catch (err) {
      // Error is handled by the hook
    }
  }, [preview, upload]);

  const handleClearPreview = useCallback(() => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" disabled={disabled}>
          <Paperclip className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="text-sm font-medium">Attach a file</div>
          
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error.message}
            </div>
          )}

          {preview ? (
            <div className="space-y-3">
              {/* Preview */}
              <div className="relative border rounded-lg p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={handleClearPreview}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                {preview.type === 'image' && preview.preview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={preview.preview}
                      alt="Preview"
                      className="max-h-32 max-w-full object-contain rounded"
                    />
                    <span className="text-xs text-muted-foreground">
                      {preview.file.name} ({formatFileSize(preview.file.size)})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{preview.file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(preview.file.size)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div className="space-y-1">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Uploading... {progress.toFixed(0)}%
                  </p>
                </div>
              )}

              {/* Upload button */}
              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                    {t('uploading')}
                  </> 
                ) : (
                  <>
                    <Upload className="h-4 w-4 me-2" />
                    {t('uploadAndSend')}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* Image upload */}
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4"
                onClick={() => imageInputRef.current?.click()}
              >
                <Image className="h-6 w-6 mb-1" />
                <span className="text-xs">Image</span>
              </Button>
              <input
                ref={imageInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'image')}
                aria-label="Select image file"
              />

              {/* File upload */}
              <Button
                variant="outline"
                className="flex flex-col h-auto py-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-6 w-6 mb-1" />
                <span className="text-xs">File</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_FILE_TYPES].join(',')}
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'file')}
                aria-label="Select file"
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Max file size: 10MB
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Component to display an attachment in a message
 */
export function MessageAttachment({ 
  url, 
  type,
  className,
}: { 
  url: string; 
  type?: 'image' | 'file';
  className?: string;
}) {
  const isImage = type === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  if (isImage) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn('block', className)}
      >
        <img
          src={url}
          alt="Attachment"
          className="max-w-full max-h-64 rounded-lg object-contain"
          loading="lazy"
        />
      </a>
    );
  }

  // Extract filename from URL
  const filename = url.split('/').pop() || 'File';
  const cleanFilename = filename.replace(/^\d+-/, ''); // Remove timestamp prefix

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors',
        className
      )}
    >
      <FileText className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm underline truncate max-w-[200px]">{cleanFilename}</span>
    </a>
  );
}
