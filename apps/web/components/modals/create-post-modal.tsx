'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePost } from '@/lib/hooks/use-api';
import type { CreatePostDto } from '@/lib/api/posts';
import { Image as ImageIcon, X, Send, Video, File as FileIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { MentionInput } from '@/components/shared/mention-input';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: 'timeline' | 'group' | 'page';
  contextId?: number;
}

/**
 * CreatePostModal Component
 * Modal for creating social posts with media upload
 * 
 * RTL/LTR Support:
 * - All labels and inputs aligned with text-start
 * - Form layout adapts to text direction
 * 
 * Theme Support:
 * - Form controls adapt to theme
 * - All text uses theme-aware colors
 */
export function CreatePostModal({ 
  open, 
  onOpenChange,
  context = 'timeline',
  contextId,
}: CreatePostModalProps) {
  const t = useTranslations('common.create.post');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mentionIds, setMentionIds] = useState<number[]>([]);
  const createPostMutation = useCreatePost();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreatePostDto>({
    defaultValues: {
      visibility: 'public',
      post_type: 'text',
    },
  });

  const onSubmit = async (data: CreatePostDto) => {
    if (!data.content?.trim() && selectedFiles.length === 0) {
      toast.error(t('contentRequired') || 'Please write something or add files');
      return;
    }

    try {
      // Determine post type based on files
      let post_type: 'text' | 'image' | 'video' | 'link' = data.post_type || 'text';
      if (selectedFiles.length > 0) {
        const firstFile = selectedFiles[0];
        if (firstFile.type.startsWith('image/')) {
          post_type = 'image';
        } else if (firstFile.type.startsWith('video/')) {
          post_type = 'video';
        } else {
          post_type = 'link';
        }
      }

      const postData: CreatePostDto = {
        content: data.content?.trim() || '',
        post_type,
        visibility: data.visibility,
      };

      if (context === 'group' && contextId) {
        postData.group_id = contextId;
      } else if (context === 'page' && contextId) {
        postData.page_id = contextId;
      }

      // Add mentionIds if any users are mentioned
      if (mentionIds.length > 0) {
        postData.mentionIds = mentionIds;
      }

      // Send files directly with the post (multipart/form-data)
      await createPostMutation.mutateAsync({ data: postData, files: selectedFiles });
      
      toast.success(t('success') || 'Post created successfully!');
      onOpenChange(false);
      reset();
      setSelectedFiles([]);
      setMentionIds([]);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      toast.error(error?.response?.data?.message || t('error') || 'Failed to create post');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 10) {
      toast.error(t('maxImages') || 'Maximum 10 files allowed');
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-start">{t('title')}</DialogTitle>
          <DialogDescription className="text-start">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-start block">
              {t('contentLabel')} *
            </Label>
            <Textarea
              id="content"
              {...register('content', { required: t('contentRequired') })}
              placeholder={t('contentPlaceholder')}
              rows={6}
              className="text-start resize-none"
            />
            {errors.content && (
              <p className="text-sm text-destructive text-start">{errors.content.message}</p>
            )}
          </div>

          {/* Mention Input */}
          <div className="space-y-2">
            <Label className="text-start block">Mention People</Label>
            <MentionInput
              value={mentionIds}
              onChange={setMentionIds}
              placeholder="Mention people..."
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-start block">{t('photosLabel') || 'Attach Files'}</Label>
            <div className="flex gap-2">
              <div className="border-2 border-dashed rounded-lg p-4 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={selectedFiles.length >= 10}
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t('photosHint') || 'Upload images'}
                  </span>
                </label>
              </div>
              <div className="border-2 border-dashed rounded-lg p-4 flex-1">
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-upload"
                  disabled={selectedFiles.length >= 10}
                />
                <label
                  htmlFor="video-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Video className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Upload videos
                  </span>
                </label>
              </div>
              <div className="border-2 border-dashed rounded-lg p-4 flex-1">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={selectedFiles.length >= 10}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Upload files
                  </span>
                </label>
              </div>
            </div>
            {selectedFiles.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected (max 10)
              </p>
            )}
          </div>

          {/* File Previews */}
          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {selectedFiles.map((file, index) => {
                const preview = getFilePreview(file);
                return (
                  <div key={index} className="relative aspect-square border rounded-lg overflow-hidden bg-muted">
                    {preview ? (
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 end-1 h-6 w-6"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {file.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Visibility */}
          {context === 'timeline' && (
            <div className="space-y-2">
              <Label className="text-start block">{t('visibilityLabel')}</Label>
              <Select
                onValueChange={(value) => setValue('visibility', value )}
                defaultValue="public"
              >
                <SelectTrigger className="text-start">
                  <SelectValue placeholder={t('visibilityPlaceholder')} />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">{t('visibilityPublic')}</SelectItem>
                    <SelectItem value="friends">{t('visibilityFriends')}</SelectItem>
                    <SelectItem value="private">{t('visibilityPrivate')}</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                reset();
                setSelectedFiles([]);
                setMentionIds([]);
              }}
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button 
              type="submit" 
              disabled={createPostMutation.isPending}
              className="gap-2"
            >
              {createPostMutation.isPending ? (
                t('creating') || 'Posting...'
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t('createButton') || 'Create Post'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
