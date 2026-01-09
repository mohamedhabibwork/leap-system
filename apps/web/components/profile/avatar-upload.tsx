'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Loader2, Camera } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName?: string;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
}

export function AvatarUpload({ currentAvatar, userName, onUpload, uploading }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    onUpload(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayAvatar = preview || currentAvatar;
  const initials = userName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={displayAvatar} alt={userName} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <button
          onClick={handleClick}
          disabled={uploading}
          className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 shadow-lg"
          title="Change avatar"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>
      <div>
        <Button type="button" variant="outline" onClick={handleClick} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Change Photo
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG or GIF. Max size 2MB
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
