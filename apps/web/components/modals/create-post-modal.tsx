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
import { useFileUpload } from '@/lib/hooks/use-upload';
import type { CreatePostDto } from '@/lib/api/posts';
import { Image as ImageIcon, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const createPostMutation = useCreatePost();
  const uploadFile = useFileUpload();
  
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
    try {
      // Upload images first if any
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        toast.info(t('uploading'));
        const uploadPromises = selectedImages.map((file) =>
          uploadFile.upload({ file, folder: 'posts' })
        );
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map((result: any) => result.url);
      }

      // Determine post type based on content
      const post_type = imageUrls.length > 0 ? 'image' : 'text';

      // Prepare content (for images, we can store URLs in content or handle separately)
      let finalContent = data.content;
      if (imageUrls.length > 0) {
        // Append image URLs to content as markdown or keep separate
        finalContent = `${data.content}\n\n${imageUrls.map(url => `![](${url})`).join('\n')}`;
      }

      const postData: CreatePostDto = {
        content: finalContent,
        post_type,
        visibility: data.visibility,
      };

      if (context === 'group' && contextId) {
        postData.group_id = contextId;
      } else if (context === 'page' && contextId) {
        postData.page_id = contextId;
      }

      await createPostMutation.mutateAsync(postData);
      toast.success(t('success'));
      onOpenChange(false);
      reset();
      setSelectedImages([]);
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 10) {
      toast.error(t('maxImages'));
      return;
    }
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
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

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-start block">{t('photosLabel')}</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
                disabled={selectedImages.length >= 10}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t('photosHint')}
                </span>
              </label>
            </div>
          </div>

          {/* Image Previews */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 end-1 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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
                setSelectedImages([]);
              }}
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button 
              type="submit" 
              disabled={createPostMutation.isPending || uploadFile.isUploading}
              className="gap-2"
            >
              {uploadFile.isUploading ? (
                t('uploading', { defaultValue: 'Uploading...' })
              ) : createPostMutation.isPending ? (
                t('creating')
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t('createButton')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
