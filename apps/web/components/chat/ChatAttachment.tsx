'use client';

import { useState, useRef, useCallback } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<AttachmentPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    // Validate file type
    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : [...ALLOWED_IMAGE_TYPES, ...ALLOWED_FILE_TYPES];
    if (!allowedTypes.includes(file.type)) {
      setError(`File type not supported. Allowed types: ${type === 'image' ? 'JPEG, PNG, GIF, WebP' : 'Images, PDF, Word, Excel, Text, ZIP'}`);
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

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', preview.file);
      formData.append('folder', 'chat-attachments');

      // Simulate progress (actual progress would require XMLHttpRequest or a library that supports it)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);

      // Call onAttach with the uploaded URL
      onAttach(result.url, preview.type);
      
      // Reset state
      setTimeout(() => {
        setPreview(null);
        setIsOpen(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [preview, onAttach]);

  const handleClearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
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
              {error}
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
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Uploading... {uploadProgress}%
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
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Send
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
