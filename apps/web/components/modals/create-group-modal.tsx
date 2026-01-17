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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateGroup } from '@/lib/hooks/use-api';
import type { CreateGroupDto } from '@/lib/api/groups';
import { Users, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useUnifiedFileUpload } from '@/components/upload/unified-file-upload';
import Image from 'next/image';

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * CreateGroupModal Component
 * Modal for creating social groups
 * 
 * RTL/LTR Support:
 * - All labels and inputs aligned with text-start
 * - Form layout adapts to text direction
 * 
 * Theme Support:
 * - Form controls adapt to theme
 * - All text uses theme-aware colors
 */
export function CreateGroupModal({ open, onOpenChange }: CreateGroupModalProps) {
  const t = useTranslations('common.create.group');
  const createGroupMutation = useCreateGroup();
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CreateGroupDto>({
    defaultValues: {
      privacy: 'public',
    },
  });
  
  // File upload hook
  const { upload, isUploading: isUploadingImage, progress: uploadProgress } = useUnifiedFileUpload({
    folder: 'groups',
    accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    onSuccess: (response) => {
      setCoverImageUrl(response.url);
      setValue('coverImage', response.url);
      toast.success(t('imageUploaded', { defaultValue: 'Image uploaded successfully' }));
    },
    onError: (error) => {
      toast.error(t('imageUploadError', { defaultValue: 'Failed to upload image' }));
    },
  });

  const onSubmit = async (data: CreateGroupDto) => {
    try {
      const groupData: CreateGroupDto = {
        ...data,
        coverImage: coverImageUrl || data.coverImage,
      };
      await createGroupMutation.mutateAsync(groupData);
      toast.success(t('success'));
      onOpenChange(false);
      reset();
      setCoverImageUrl(null);
      setCoverImagePreview(null);
    } catch (error) {
      toast.error(t('error'));
    }
  };
  
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload file
    try {
      await upload(file);
    } catch (error) {
      // Error handled by hook
    }
  };
  
  const removeImage = () => {
    setCoverImageUrl(null);
    setCoverImagePreview(null);
    setValue('coverImage', undefined);
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
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-start block">
              {t('nameLabel')} *
            </Label>
            <Input
              id="name"
              {...register('name', { required: t('nameRequired') })}
              placeholder={t('namePlaceholder')}
              className="text-start"
            />
            {errors.name && (
              <p className="text-sm text-destructive text-start">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-start block">
              {t('descriptionLabel')}
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('descriptionPlaceholder')}
              rows={5}
              className="text-start resize-none"
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="coverImage" className="text-start block">
              {t('coverImageLabel')}
            </Label>
            {coverImagePreview || coverImageUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                <Image
                  src={coverImagePreview || coverImageUrl || ''}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 end-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isUploadingImage}
                  className="text-start"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('coverImage')?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <Upload className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            {isUploadingImage && (
              <div className="text-xs text-muted-foreground text-start">
                {t('uploading', { defaultValue: 'Uploading...' })} {uploadProgress.toFixed(0)}%
              </div>
            )}
            <p className="text-xs text-muted-foreground text-start">
              {t('coverImageHint')}
            </p>
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <Label className="text-start block">{t('privacyLabel')} *</Label>
            <Select
              onValueChange={(value) => setValue('privacy', value as 'public' | 'private')}
              defaultValue="public"
            >
              <SelectTrigger className="text-start">
                <SelectValue placeholder={t('privacyPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="text-start">
                    <div className="font-medium">{t('publicTitle')}</div>
                    <div className="text-xs text-muted-foreground">
                      {t('publicDescription')}
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="text-start">
                    <div className="font-medium">{t('privateTitle')}</div>
                    <div className="text-xs text-muted-foreground">
                      {t('privateDescription')}
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button 
              type="submit" 
              disabled={createGroupMutation.isPending}
              className="gap-2"
            >
              {createGroupMutation.isPending ? (
                <>
                  <Users className="h-4 w-4 animate-pulse" />
                  {t('creating')}
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
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
