'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useUnifiedFileUpload } from './unified-file-upload';

interface FileUploadProps {
  onUpload?: (file: File) => Promise<void>;
  onUploadComplete?: (response: any) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  folder?: string;
}

export function FileUpload({
  onUpload,
  onUploadComplete,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  disabled = false,
  className,
  folder = 'general',
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Convert accept object to array format for unified upload
  const acceptArray = accept ? Object.keys(accept).flatMap(key => accept[key].map(ext => `${key}/${ext}`)) : undefined;

  const { upload, uploadMultiple, isUploading: uploading, progress: uploadProgress, error } = useUnifiedFileUpload({
    folder,
    maxSize,
    accept: acceptArray,
    multiple,
    onSuccess: (response) => {
      if (onUploadComplete) {
        onUploadComplete(response);
      }
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        if (multiple) {
          const responses = await uploadMultiple(acceptedFiles);
          setUploadedFiles((prev) => [...prev, ...responses.map(r => r.originalName)]);
          if (onUploadComplete) {
            onUploadComplete(responses);
          }
        } else {
          const response = await upload(acceptedFiles[0]);
          setUploadedFiles((prev) => [...prev, response.originalName]);
          if (onUpload) {
            await onUpload(acceptedFiles[0]);
          }
          if (onUploadComplete) {
            onUploadComplete(response);
          }
        }
      } catch (err: any) {
        // Error is handled by the hook
      }
    },
    [upload, uploadMultiple, multiple, onUpload, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled: disabled || uploading,
  });

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50',
          error && 'border-destructive',
          className
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          
          {isDragActive ? (
            <p className="text-sm text-primary">Drop files here...</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Drag & drop files here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Max file size: {(maxSize / 1024 / 1024).toFixed(0)}MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-xs text-muted-foreground text-center">
            Uploading... {uploadProgress.toFixed(0)}%
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error.message}</span>
        </div>
      )}

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="space-y-1">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                {file.name}: {errors[0].message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files:</p>
          {uploadedFiles.map((name, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded"
            >
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="flex-1">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
