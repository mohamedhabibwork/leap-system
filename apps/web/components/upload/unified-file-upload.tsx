'use client';

import { useState, useCallback, useRef } from 'react';
import { mediaAPI, UploadResponse } from '@/lib/api/media';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UnifiedFileUploadOptions {
  folder?: string;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  maxSize?: number; // in bytes
  accept?: string[];
  multiple?: boolean;
}

export interface UnifiedFileUploadResult {
  upload: (file: File) => Promise<UploadResponse>;
  uploadMultiple: (files: File[]) => Promise<UploadResponse[]>;
  cancel: () => void;
  isUploading: boolean;
  progress: number;
  error: Error | null;
}

/**
 * Unified file upload hook that uses the mediaAPI
 * All file uploads should use this hook to ensure consistency
 */
export function useUnifiedFileUpload(options: UnifiedFileUploadOptions = {}): UnifiedFileUploadResult {
  const {
    folder = 'general',
    onSuccess,
    onError,
    onProgress,
    maxSize,
    accept,
    multiple = false,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadResponse> => {
      // Validate file size
      if (maxSize && file.size > maxSize) {
        const error = new Error(`File size exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
        setError(error);
        onError?.(error);
        throw error;
      }

      // Validate file type
      if (accept && accept.length > 0 && !accept.includes(file.type)) {
        const error = new Error(`File type ${file.type} is not allowed. Allowed types: ${accept.join(', ')}`);
        setError(error);
        onError?.(error);
        throw error;
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);
      abortControllerRef.current = new AbortController();

      try {
        // Use mediaAPI for upload with progress tracking
        const response = await mediaAPI.upload(file, folder, {
          onUploadProgress: (progressEvent) => {
            const currentProgress = progressEvent.total
              ? (progressEvent.loaded / progressEvent.total) * 100
              : 0;
            setProgress(currentProgress);
            onProgress?.(currentProgress);
          },
          signal: abortControllerRef.current?.signal,
        });
        
        setProgress(100);
        setIsUploading(false);
        onSuccess?.(response);
        onProgress?.(100);
        
        return response;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error('Upload failed');
        setError(uploadError);
        setIsUploading(false);
        onError?.(uploadError);
        throw uploadError;
      }
    },
    [folder, maxSize, accept, onSuccess, onError, onProgress]
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<UploadResponse[]> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const uploadPromises = files.map(async (file, index) => {
          const result = await upload(file);
          // Update progress based on completed uploads
          const currentProgress = ((index + 1) / files.length) * 100;
          setProgress(currentProgress);
          onProgress?.(currentProgress);
          return result;
        });

        const results = await Promise.all(uploadPromises);
        setIsUploading(false);
        setProgress(100);
        return results;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error('Batch upload failed');
        setError(uploadError);
        setIsUploading(false);
        onError?.(uploadError);
        throw uploadError;
      }
    },
    [upload, onProgress, onError]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsUploading(false);
    setProgress(0);
    setError(new Error('Upload cancelled'));
  }, []);

  return {
    upload,
    uploadMultiple,
    cancel,
    isUploading,
    progress,
    error,
  };
}

/**
 * Unified File Upload Component
 * A reusable component for file uploads that uses the unified upload API
 */
export interface UnifiedFileUploadComponentProps {
  folder?: string;
  onUploadComplete?: (response: UploadResponse | UploadResponse[]) => void;
  onUploadError?: (error: Error) => void;
  maxSize?: number;
  accept?: string[];
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  showProgress?: boolean;
  children?: React.ReactNode;
}

export function UnifiedFileUploadComponent({
  folder = 'general',
  onUploadComplete,
  onUploadError,
  maxSize,
  accept,
  multiple = false,
  disabled = false,
  className,
  showProgress = true,
  children,
}: UnifiedFileUploadComponentProps) {
  const { upload, uploadMultiple, isUploading, progress, error } = useUnifiedFileUpload({
    folder,
    onSuccess: (response) => {
      onUploadComplete?.(response);
    },
    onError: (err) => {
      onUploadError?.(err);
    },
    maxSize,
    accept,
    multiple,
  });

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      
      try {
        if (multiple) {
          await uploadMultiple(fileArray);
        } else {
          await upload(fileArray[0]);
        }
      } catch (err) {
        // Error already handled by hook
      }
    },
    [upload, uploadMultiple, multiple]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {children && (
        <div onClick={() => !disabled && !isUploading && document.getElementById('unified-file-input')?.click()}>
          {children}
        </div>
      )}
      
      <input
        id="unified-file-input"
        type="file"
        accept={accept?.join(',')}
        multiple={multiple}
        disabled={disabled || isUploading}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        aria-label="File upload input"
      />

      {showProgress && isUploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground text-center">
            Uploading... {progress.toFixed(0)}%
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Upload Status Display Component
 */
export interface UploadStatusProps {
  isUploading: boolean;
  progress: number;
  error: Error | null;
  success?: boolean;
  className?: string;
}

export function UploadStatus({
  isUploading,
  progress,
  error,
  success = false,
  className,
}: UploadStatusProps) {
  if (!isUploading && !error && !success) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {isUploading && (
        <div className="space-y-1">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground text-center">
            Uploading... {progress.toFixed(0)}%
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error.message}</span>
        </div>
      )}

      {success && !isUploading && !error && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>Upload successful</span>
        </div>
      )}
    </div>
  );
}
