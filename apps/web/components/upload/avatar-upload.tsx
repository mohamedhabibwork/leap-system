'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<string>; // Returns new avatar URL
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  xl: 'h-40 w-40',
};

export function AvatarUpload({
  currentAvatar,
  onUpload,
  name = 'User',
  size = 'lg',
  disabled = false,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        const url = await onUpload(file);
        // Preview will remain until component unmounts or new upload
      } catch (err: any) {
        setError(err.message || 'Upload failed');
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: disabled || uploading,
  });

  const displayAvatar = preview || currentAvatar;
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className={cn(sizeClasses[size])}>
          <AvatarImage src={displayAvatar} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        {/* Upload Overlay */}
        <div
          {...getRootProps()}
          className={cn(
            'absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer',
            uploading && 'opacity-100',
            disabled && 'cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="text-white text-xs">Uploading...</div>
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>

        {/* Remove Button */}
        {displayAvatar && !uploading && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              // Optionally call onRemove callback
            }}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Upload Button */}
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Change Avatar'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG, GIF or WEBP. Max 5MB.
      </p>
    </div>
  );
}
