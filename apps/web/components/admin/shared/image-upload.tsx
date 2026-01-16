'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useUnifiedFileUpload } from '@/components/upload/unified-file-upload';

interface ImageUploadProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string[];
  className?: string;
  disabled?: boolean;
  onUploadStart?: () => void;
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: Error) => void;
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

/**
 * Image upload component with drag-and-drop support
 * 
 * Features:
 * - Drag-and-drop zone
 * - Click to browse
 * - Image preview with thumbnail
 * - Upload progress indicator
 * - File validation (type, size)
 * - Multiple file support
 * - Delete uploaded images
 */
export function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className,
  disabled = false,
  onUploadStart,
  onUploadComplete,
  onUploadError,
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(
    Array.isArray(value) ? value : value ? [value] : []
  );

  const { upload, uploadMultiple } = useUnifiedFileUpload({
    folder: 'images',
    maxSize,
    accept,
    multiple,
    onSuccess: (response) => {
      // Success is handled in onDrop
    },
    onError: (error) => {
      onUploadError?.(error);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      // Check if adding these files would exceed maxFiles
      const totalFiles = uploadedUrls.length + acceptedFiles.length;
      if (!multiple && totalFiles > 1) {
        acceptedFiles = [acceptedFiles[0]];
      } else if (totalFiles > maxFiles) {
        acceptedFiles = acceptedFiles.slice(0, maxFiles - uploadedUrls.length);
      }

      onUploadStart?.();

      // Add files to uploading state
      const newUploadingFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Upload files
      try {
        const uploadPromises = acceptedFiles.map(async (file, index) => {
          try {
            // Update progress during upload
            const progressInterval = setInterval(() => {
              setUploadingFiles((prev) =>
                prev.map((f, i) =>
                  f.file === file ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
                )
              );
            }, 200);

            const response = await upload(file);

            clearInterval(progressInterval);

            // Update progress to 100%
            setUploadingFiles((prev) =>
              prev.map((f) => (f.file === file ? { ...f, progress: 100 } : f))
            );

            return response.url;
          } catch (error) {
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.file === file
                  ? { ...f, error: error instanceof Error ? error.message : 'Upload failed' }
                  : f
              )
            );
            onUploadError?.(error instanceof Error ? error : new Error('Upload failed'));
            return null;
          }
        });

        const uploadedUrlsResult = (await Promise.all(uploadPromises)).filter(
          (url): url is string => url !== null
        );

        // Update uploaded URLs
        const newUrls = [...uploadedUrls, ...uploadedUrlsResult];
        setUploadedUrls(newUrls);

        // Call onChange
        if (onChange) {
          onChange(multiple ? newUrls : newUrls[0] || '');
        }

        onUploadComplete?.(uploadedUrlsResult);

        // Clear uploading files after a delay
        setTimeout(() => {
          setUploadingFiles([]);
        }, 1000);
      } catch (error) {
        console.error('Upload error:', error);
      }
    },
    [disabled, multiple, maxFiles, uploadedUrls, onChange, onUploadStart, onUploadComplete, onUploadError, upload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple,
    disabled,
  });

  const removeImage = (index: number) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(newUrls);
    if (onChange) {
      onChange(multiple ? newUrls : newUrls[0] || '');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          !isDragActive && 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the images here...</p>
            ) : (
              <>
                <p>Drag & drop images here, or click to browse</p>
                <p className="text-xs text-gray-500 mt-1">
                  {accept.map((a) => a.split('/')[1]).join(', ')} up to{' '}
                  {(maxSize / 1024 / 1024).toFixed(0)}MB
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Uploading files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((file, index) => (
            <div
              key={`${file.file.name}-${index}`}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={file.preview}
                  alt={file.file.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                {file.error ? (
                  <p className="text-xs text-red-500">{file.error}</p>
                ) : (
                  <Progress value={file.progress} className="h-1 mt-1" />
                )}
              </div>
              {file.progress === 100 && !file.error && (
                <div className="text-green-500">
                  <ImageIcon className="h-4 w-4" />
                </div>
              )}
              {file.progress < 100 && !file.error && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded images */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadedUrls.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden border">
                <Image src={url} alt={`Uploaded ${index + 1}`} fill className="object-cover" />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
