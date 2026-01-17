'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
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
import { useCreatePage } from '@/lib/hooks/use-api';
import type { CreatePageDto } from '@/lib/api/pages';
import { FileText, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateUniqueSlug } from '@/lib/utils/slug';
import { useUnifiedFileUpload } from '@/components/upload/unified-file-upload';
import Image from 'next/image';

interface CreatePageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * CreatePageModal Component
 * Modal for creating pages (like Facebook/LinkedIn pages)
 * 
 * RTL/LTR Support:
 * - All labels and inputs aligned with text-start
 * - Form layout adapts to text direction
 * 
 * Theme Support:
 * - Form controls adapt to theme
 * - All text uses theme-aware colors
 */
export function CreatePageModal({ open, onOpenChange }: CreatePageModalProps) {
  const t = useTranslations('common.create.page');
  const createPageMutation = useCreatePage();
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    control,
  } = useForm<CreatePageDto>();
  
  // Cover image upload hook
  const { upload: uploadCover, isUploading: isUploadingCover, progress: coverProgress } = useUnifiedFileUpload({
    folder: 'pages',
    accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    onSuccess: (response) => {
      setCoverImageUrl(response.url);
      setValue('coverImageUrl', response.url);
      toast.success(t('coverImageUploaded', { defaultValue: 'Cover image uploaded successfully' }));
    },
    onError: (error) => {
      toast.error(t('coverImageUploadError', { defaultValue: 'Failed to upload cover image' }));
    },
  });
  
  // Profile image upload hook
  const { upload: uploadProfile, isUploading: isUploadingProfile, progress: profileProgress } = useUnifiedFileUpload({
    folder: 'pages',
    accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    onSuccess: (response) => {
      setProfileImageUrl(response.url);
      setValue('profileImageUrl', response.url);
      toast.success(t('profileImageUploaded', { defaultValue: 'Profile image uploaded successfully' }));
    },
    onError: (error) => {
      toast.error(t('profileImageUploadError', { defaultValue: 'Failed to upload profile image' }));
    },
  });

  const onSubmit = async (data: CreatePageDto) => {
    try {
      // Generate slug from name
      const slug = generateUniqueSlug(data.name);

      const pageData: CreatePageDto = {
        name: data.name,
        slug,
        description: data.description,
        coverImageUrl: coverImageUrl || data.coverImageUrl,
        profileImageUrl: profileImageUrl || data.profileImageUrl,
        categoryId: data.categoryId,
      };

      await createPageMutation.mutateAsync(pageData);
      toast.success(t('success'));
      onOpenChange(false);
      reset();
      setCoverImageUrl(null);
      setCoverImagePreview(null);
      setProfileImageUrl(null);
      setProfileImagePreview(null);
    } catch (error) {
      toast.error(t('error'));
    }
  };
  
  const handleCoverImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await uploadCover(file);
    } catch (error) {
      // Error handled by hook
    }
  };
  
  const handleProfileImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload file
    try {
      await uploadProfile(file);
    } catch (error) {
      // Error handled by hook
    }
  };
  
  const removeCoverImage = () => {
    setCoverImageUrl(null);
    setCoverImagePreview(null);
    setValue('coverImageUrl', undefined);
  };
  
  const removeProfileImage = () => {
    setProfileImageUrl(null);
    setProfileImagePreview(null);
    setValue('profileImageUrl', undefined);
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
            <p className="text-xs text-muted-foreground text-start">
              {t('descriptionHint')}
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-start block">{t('categoryLabel')}</Label>
            <Select
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger className="text-start">
                <SelectValue placeholder={t('categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">{t('categories.business')}</SelectItem>
                <SelectItem value="education">{t('categories.education')}</SelectItem>
                <SelectItem value="community">{t('categories.community')}</SelectItem>
                <SelectItem value="brand">{t('categories.brand')}</SelectItem>
                <SelectItem value="organization">{t('categories.organization')}</SelectItem>
                <SelectItem value="public_figure">{t('categories.public_figure')}</SelectItem>
                <SelectItem value="entertainment">{t('categories.entertainment')}</SelectItem>
                <SelectItem value="nonprofit">{t('categories.nonprofit')}</SelectItem>
                <SelectItem value="other">{t('categories.other')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground text-start">
              {t('categoryHint')}
            </p>
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
                  onClick={removeCoverImage}
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
                  onChange={handleCoverImageSelect}
                  disabled={isUploadingCover}
                  className="text-start"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('coverImage')?.click()}
                  disabled={isUploadingCover}
                >
                  {isUploadingCover ? (
                    <Upload className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            {isUploadingCover && (
              <div className="text-xs text-muted-foreground text-start">
                {t('uploading', { defaultValue: 'Uploading...' })} {coverProgress.toFixed(0)}%
              </div>
            )}
            <p className="text-xs text-muted-foreground text-start">
              {t('coverImageHint')}
            </p>
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <Label htmlFor="profileImage" className="text-start block">
              {t('profileImageLabel', { defaultValue: 'Profile Image' })}
            </Label>
            {profileImagePreview || profileImageUrl ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border border-border">
                <Image
                  src={profileImagePreview || profileImageUrl || ''}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 end-2"
                  onClick={removeProfileImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageSelect}
                  disabled={isUploadingProfile}
                  className="text-start"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('profileImage')?.click()}
                  disabled={isUploadingProfile}
                >
                  {isUploadingProfile ? (
                    <Upload className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            {isUploadingProfile && (
              <div className="text-xs text-muted-foreground text-start">
                {t('uploading', { defaultValue: 'Uploading...' })} {profileProgress.toFixed(0)}%
              </div>
            )}
            <p className="text-xs text-muted-foreground text-start">
              {t('profileImageHint', { defaultValue: 'Upload a profile image for your page (max 5MB)' })}
            </p>
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
              disabled={createPageMutation.isPending}
              className="gap-2"
            >
              {createPageMutation.isPending ? (
                <>
                  <FileText className="h-4 w-4 animate-pulse" />
                  {t('creating')}
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
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
