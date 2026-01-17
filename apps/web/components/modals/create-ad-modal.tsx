'use client';

import { useState, useEffect } from 'react';
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
import { useCreateAdminAd, useUpdateAdminAd, useAdminAd } from '@/lib/hooks/use-api';
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { useUnifiedFileUpload } from '@/components/upload/unified-file-upload';
import { toast } from 'sonner';
import Image from 'next/image';
import { Upload, X, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adId?: number; // If provided, this is an edit modal
}

interface AdFormData {
  campaignId?: number;
  adTypeId: number;
  targetType?: 'course' | 'event' | 'job' | 'post' | 'external';
  targetId?: number;
  externalUrl?: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  mediaUrl?: string;
  callToAction?: string;
  placementTypeId: number;
  priority?: number;
  startDate: string;
  endDate?: string;
  isPaid?: boolean;
  targetingRules?: {
    targetUserRoles?: string[];
    targetSubscriptionPlans?: number[];
  };
}

export function CreateAdModal({ open, onOpenChange, adId }: CreateAdModalProps) {
  const t = useTranslations('common');
  const params = useParams();
  const locale = (params.locale as 'en' | 'ar') || 'en';
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const createAdMutation = useCreateAdminAd();
  const updateAdMutation = useUpdateAdminAd();

  // Fetch ad data if editing
  const { data: adData, isLoading: isLoadingAd } = useAdminAd(adId || 0);

  // Fetch lookup data
  const { data: adTypes, isLoading: adTypesLoading } = useLookupsByType('ad_type');
  const { data: placementTypes, isLoading: placementTypesLoading } = useLookupsByType('placement_type');
  const { data: adStatuses, isLoading: adStatusesLoading } = useLookupsByType('ad_status');

  // File upload hook
  const { upload, isUploading: isUploadingMedia, progress: uploadProgress } = useUnifiedFileUpload({
    folder: 'ads',
    accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'],
    maxSize: 10 * 1024 * 1024, // 10MB
    onSuccess: (response) => {
      setMediaUrl(response.url);
      toast.success('Media uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload media');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
    reset,
  } = useForm<AdFormData>({
    defaultValues: {
      priority: 0,
      isPaid: false,
      targetType: 'external',
    },
  });

  // Load ad data when editing
  useEffect(() => {
    if (adId && adData && open) {
      const ad = (adData )?.data || adData;
      if (ad) {
        reset({
          campaignId: ad.campaignId,
          adTypeId: ad.adTypeId,
          targetType: ad.targetType || 'external',
          targetId: ad.targetId,
          externalUrl: ad.externalUrl,
          titleEn: ad.titleEn,
          titleAr: ad.titleAr,
          descriptionEn: ad.descriptionEn,
          descriptionAr: ad.descriptionAr,
          mediaUrl: ad.mediaUrl,
          callToAction: ad.callToAction,
          placementTypeId: ad.placementTypeId,
          priority: ad.priority || 0,
          startDate: ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 16) : '',
          endDate: ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 16) : '',
          isPaid: ad.isPaid || false,
        });
        if (ad.mediaUrl) {
          setMediaUrl(ad.mediaUrl);
        }
      }
    } else if (!adId && open) {
      // Reset form when creating new ad
      reset({
        priority: 0,
        isPaid: false,
        targetType: 'external',
      });
      setMediaUrl(null);
      setMediaPreview(null);
    }
  }, [adId, adData, open, reset]);

  const targetType = watch('targetType');

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    await upload(file);
  };

  const removeMedia = () => {
    setMediaUrl(null);
    setMediaPreview(null);
    setValue('mediaUrl', '');
  };

  const onSubmit = async (data: AdFormData) => {
    try {
      // Validate target
      if (data.targetType !== 'external' && !data.targetId) {
        toast.error('Target ID is required for non-external ads');
        return;
      }
      if (data.targetType === 'external' && !data.externalUrl) {
        toast.error('External URL is required for external ads');
        return;
      }

      const submitData = {
        ...data,
        mediaUrl: mediaUrl || data.mediaUrl,
      };

      if (adId) {
        await updateAdMutation.mutateAsync({ id: adId, data: submitData });
        toast.success('Ad updated successfully');
      } else {
        await createAdMutation.mutateAsync(submitData);
        toast.success('Ad created successfully');
      }

      reset();
      setMediaUrl(null);
      setMediaPreview(null);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save ad');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{adId ? 'Edit Ad' : 'Create New Ad'}</DialogTitle>
          <DialogDescription>
            {adId ? 'Update ad details' : 'Fill in the details to create a new ad'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            {/* Title (English) */}
            <div className="space-y-2">
              <Label htmlFor="titleEn" className="text-start block">
                Title (English) *
              </Label>
              <Input
                id="titleEn"
                {...register('titleEn', { required: 'Title is required' })}
                placeholder="Enter ad title in English"
                className="text-start"
              />
              {errors.titleEn && (
                <p className="text-sm text-destructive text-start">{errors.titleEn.message}</p>
              )}
            </div>

            {/* Title (Arabic) */}
            <div className="space-y-2">
              <Label htmlFor="titleAr" className="text-start block">
                Title (Arabic)
              </Label>
              <Input
                id="titleAr"
                {...register('titleAr')}
                placeholder="Enter ad title in Arabic"
                className="text-start"
              />
            </div>

            {/* Description (English) */}
            <div className="space-y-2">
              <Label htmlFor="descriptionEn" className="text-start block">
                Description (English)
              </Label>
              <Textarea
                id="descriptionEn"
                {...register('descriptionEn')}
                placeholder="Enter ad description in English"
                className="text-start resize-none"
                rows={3}
              />
            </div>

            {/* Description (Arabic) */}
            <div className="space-y-2">
              <Label htmlFor="descriptionAr" className="text-start block">
                Description (Arabic)
              </Label>
              <Textarea
                id="descriptionAr"
                {...register('descriptionAr')}
                placeholder="Enter ad description in Arabic"
                className="text-start resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Ad Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ad Configuration</h3>

            {/* Ad Type */}
            <div className="space-y-2">
              <Label htmlFor="adTypeId" className="text-start block">
                Ad Type *
              </Label>
              <Controller
                name="adTypeId"
                control={control}
                rules={{ required: 'Ad type is required' }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                    disabled={adTypesLoading}
                  >
                    <SelectTrigger className="text-start" id="adTypeId">
                      <SelectValue placeholder="Select ad type" />
                    </SelectTrigger>
                    <SelectContent>
                      {adTypesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : adTypes && adTypes.length > 0 ? (
                        adTypes.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {locale === 'ar' && type.nameAr ? type.nameAr : type.nameEn}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          No options available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.adTypeId && (
                <p className="text-sm text-destructive text-start">{errors.adTypeId.message}</p>
              )}
            </div>

            {/* Placement Type */}
            <div className="space-y-2">
              <Label htmlFor="placementTypeId" className="text-start block">
                Placement Type *
              </Label>
              <Controller
                name="placementTypeId"
                control={control}
                rules={{ required: 'Placement type is required' }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                    disabled={placementTypesLoading}
                  >
                    <SelectTrigger className="text-start" id="placementTypeId">
                      <SelectValue placeholder="Select placement type" />
                    </SelectTrigger>
                    <SelectContent>
                      {placementTypesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : placementTypes && placementTypes.length > 0 ? (
                        placementTypes.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {locale === 'ar' && type.nameAr ? type.nameAr : type.nameEn}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          No options available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.placementTypeId && (
                <p className="text-sm text-destructive text-start">{errors.placementTypeId.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-start block">
                Priority
              </Label>
              <Input
                id="priority"
                type="number"
                {...register('priority', { valueAsNumber: true, min: 0, max: 100 })}
                placeholder="0-100"
                className="text-start"
              />
              <p className="text-xs text-muted-foreground text-start">
                Higher priority ads are shown first (0-100)
              </p>
            </div>

            {/* Is Paid */}
            <div className="flex items-center space-x-2">
              <Controller
                name="isPaid"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isPaid"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isPaid" className="text-start cursor-pointer">
                This is a paid ad
              </Label>
            </div>
          </div>

          {/* Target Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Target Configuration</h3>

            {/* Target Type */}
            <div className="space-y-2">
              <Label htmlFor="targetType" className="text-start block">
                Target Type
              </Label>
              <Controller
                name="targetType"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="text-start" id="targetType">
                      <SelectValue placeholder="Select target type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="external">External URL</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="job">Job</SelectItem>
                      <SelectItem value="post">Post</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* External URL or Target ID */}
            {targetType === 'external' ? (
              <div className="space-y-2">
                <Label htmlFor="externalUrl" className="text-start block">
                  External URL *
                </Label>
                <Input
                  id="externalUrl"
                  {...register('externalUrl', {
                    required: targetType === 'external' ? 'External URL is required' : false,
                  })}
                  placeholder="https://example.com"
                  className="text-start"
                />
                {errors.externalUrl && (
                  <p className="text-sm text-destructive text-start">{errors.externalUrl.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="targetId" className="text-start block">
                  Target ID *
                </Label>
                <Input
                  id="targetId"
                  type="number"
                  {...register('targetId', {
                    required: targetType !== 'external' ? 'Target ID is required' : false,
                    valueAsNumber: true,
                  })}
                  placeholder="Enter target ID"
                  className="text-start"
                />
                {errors.targetId && (
                  <p className="text-sm text-destructive text-start">{errors.targetId.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Media</h3>

            {/* Media Upload */}
            <div className="space-y-2">
              <Label htmlFor="media" className="text-start block">
                Media (Image or Video)
              </Label>
              {mediaPreview || mediaUrl ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                  {mediaPreview ? (
                    <Image
                      src={mediaPreview}
                      alt="Media preview"
                      fill
                      className="object-cover"
                    />
                  ) : mediaUrl ? (
                    <Image
                      src={mediaUrl}
                      alt="Media"
                      fill
                      className="object-cover"
                    />
                  ) : null}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 end-2"
                    onClick={removeMedia}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaSelect}
                    disabled={isUploadingMedia}
                    className="text-start"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => document.getElementById('media')?.click()}
                    disabled={isUploadingMedia}
                  >
                    {isUploadingMedia ? (
                      <Upload className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
              {isUploadingMedia && (
                <div className="text-xs text-muted-foreground text-start">
                  Uploading... {uploadProgress.toFixed(0)}%
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="space-y-2">
              <Label htmlFor="callToAction" className="text-start block">
                Call to Action
              </Label>
              <Input
                id="callToAction"
                {...register('callToAction')}
                placeholder="e.g., Learn More, Sign Up, Buy Now"
                className="text-start"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Schedule</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-start block">
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  {...register('startDate', { required: 'Start date is required' })}
                  className="text-start"
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive text-start">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-start block">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  {...register('endDate')}
                  className="text-start"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAdMutation.isPending || updateAdMutation.isPending}
            >
              {createAdMutation.isPending || updateAdMutation.isPending ? (
                'Saving...'
              ) : adId ? (
                'Update Ad'
              ) : (
                'Create Ad'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
