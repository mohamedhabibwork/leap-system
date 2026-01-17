'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateStory } from '@/lib/hooks/use-api';
import { useUnifiedFileUpload } from '@/components/upload/unified-file-upload';
import { Upload, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface StoryCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * StoryCreator Component
 * Create and upload stories (images or videos)
 * 
 * RTL/LTR Support:
 * - Form layout adapts to text direction
 * - Preview and controls flow correctly
 * 
 * Theme Support:
 * - Upload area visible in both themes
 * - Preview works with theme-aware borders
 */
export function StoryCreator({ open, onOpenChange }: StoryCreatorProps) {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createStoryMutation = useCreateStory();
  
  const { upload, isUploading: uploading } = useUnifiedFileUpload({
    folder: 'stories',
    maxSize: 50 * 1024 * 1024, // 50MB
    accept: ['image/*', 'video/*'],
    onError: (error) => {
      console.error('Failed to upload story media:', error);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return;
    }

    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaType(type);
    setMediaFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAndCreate = async () => {
    if (!mediaFile) return;

    try {
      // Upload media using unified upload
      const uploadResponse = await upload(mediaFile);
      const mediaUrl = uploadResponse.url;

      // Create story
      await createStoryMutation.mutateAsync({
        mediaUrl,
        mediaType,
        caption: caption || undefined,
        duration: mediaType === 'video' ? 15 : undefined, // Default 15s for videos
      });

      // Reset and close
      setMediaFile(null);
      setMediaPreview(null);
      setCaption('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-start">Create Story</DialogTitle>
          <DialogDescription className="text-start">
            Upload an image or video to create a story
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          {!mediaPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors bg-muted/50"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Upload Photo or Video</p>
                  <p className="text-sm text-muted-foreground">
                    Click to select a file
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max size: 50MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" type="button">
                    <ImageIcon className="w-4 h-4 me-2" />
                    Image
                  </Button>
                  <Button variant="outline" size="sm" type="button">
                    <Video className="w-4 h-4 me-2" />
                    Video
                  </Button>
                </div>
              </div>
              <input
                title="File input"
                placeholder="File input"
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-[9/16] max-h-[500px] bg-muted rounded-lg overflow-hidden">
                {mediaType === 'image' ? (
                  <Image
                    src={mediaPreview}
                    alt="Story preview"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="w-full h-full object-contain"
                    controls
                  />
                )}
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption" className="text-start block">
                  Caption (Optional)
                </Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption to your story..."
                  rows={3}
                  maxLength={200}
                  className="text-start resize-none"
                />
                <p className="text-xs text-muted-foreground text-end">
                  {caption.length}/200
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                    setCaption('');
                  }}
                  disabled={uploading}
                >
                  Change
                </Button>
                <Button
                  onClick={handleUploadAndCreate}
                  disabled={uploading || !mediaFile}
                  className="gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Story'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
