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
import { useCreateEvent, useEventCategories } from '@/lib/hooks/use-api';
import type { CreateEventDto } from '@/lib/api/events';
import { generateUniqueSlug } from '@/lib/utils/slug';
import { Calendar, MapPin, Upload, X } from 'lucide-react';
import { LookupTypeCode } from '@leap-lms/shared-types';
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { useUnifiedFileUpload } from '@/components/upload/unified-file-upload';
import { toast } from 'sonner';
import Image from 'next/image';

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * CreateEventModal Component
 * Multi-step form for creating events
 * 
 * RTL/LTR Support:
 * - All labels and inputs aligned with text-start
 * - Form layout adapts to text direction
 * - Multi-step progress flows correctly
 * 
 * Theme Support:
 * - Form controls adapt to theme
 * - Labels and descriptions use theme colors
 * - Focus states visible in both themes
 */
export function CreateEventModal({ open, onOpenChange }: CreateEventModalProps) {
  const t = useTranslations('common.create.event');
  const params = useParams();
  const locale = (params.locale as 'en' | 'ar') || 'en';
  const [step, setStep] = useState(1);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const createEventMutation = useCreateEvent();
  
  // Fetch lookup data
  const { data: eventTypes, isLoading: eventTypesLoading } = useLookupsByType(LookupTypeCode.EVENT_TYPE);
  const { data: eventStatuses, isLoading: eventStatusesLoading } = useLookupsByType(LookupTypeCode.EVENT_STATUS);
  const { data: eventCategories, isLoading: eventCategoriesLoading } = useEventCategories();
  
  // File upload hook
  const { upload, isUploading: isUploadingImage, progress: uploadProgress } = useUnifiedFileUpload({
    folder: 'events',
    accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    onSuccess: (response) => {
      setCoverImageUrl(response.url);
      toast.success(t('imageUploaded', { defaultValue: 'Image uploaded successfully' }));
    },
    onError: (error) => {
      toast.error(t('imageUploadError', { defaultValue: 'Failed to upload image' }));
    },
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<CreateEventDto>({
    defaultValues: {
      eventTypeId: undefined,
      statusId: undefined,
    },
  });

  const onSubmit = async (data: CreateEventDto) => {
    try {
      // Validate required lookup fields
      if (!data.eventTypeId || !data.statusId) {
        return; // Validation errors will be shown by react-hook-form
      }

      // Generate unique slug from title
      const slug = generateUniqueSlug(data.titleEn);

      // Prepare event data with required fields
      const eventData: CreateEventDto = {
        titleEn: data.titleEn,
        slug,
        descriptionEn: data.descriptionEn,
        eventTypeId: data.eventTypeId,
        statusId: data.statusId,
        categoryId: data.categoryId,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        timezone: data.timezone || 'UTC',
        meetingUrl: data.meetingUrl,
        capacity: data.capacity,
        coverImageUrl: coverImageUrl || undefined,
      };

      await createEventMutation.mutateAsync(eventData);
      onOpenChange(false);
      setStep(1);
      setCoverImageUrl(null);
      setCoverImagePreview(null);
    } catch (error) {
      // Error handled in mutation
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
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-start">{t('title')}</DialogTitle>
          <DialogDescription className="text-start">
            {t('step', { step })}: {step === 1 ? t('basicInfo') : t('detailsCapacity')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="titleEn" className="text-start block">
                  {t('eventTitle')} *
                </Label>
                <Input
                  id="titleEn"
                  {...register('titleEn', { required: t('titleRequired') })}
                  placeholder={t('eventTitlePlaceholder')}
                  className="text-start"
                />
                {errors.titleEn && (
                  <p className="text-sm text-destructive text-start">{errors.titleEn.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="descriptionEn" className="text-start block">
                  {t('description')}
                </Label>
                <Textarea
                  id="descriptionEn"
                  {...register('descriptionEn')}
                  placeholder={t('descriptionPlaceholder')}
                  rows={5}
                  className="text-start resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-start block">
                  {t('location')}
                </Label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder={t('locationPlaceholder')}
                    className="ps-10 text-start"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="coverImage" className="text-start block">
                  {t('coverImageLabel', { defaultValue: 'Cover Image' })}
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
                  {t('coverImageHint', { defaultValue: 'Upload a cover image for your event (max 5MB)' })}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-start block">
                    {t('startDate')} *
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...register('startDate', { required: t('startDateRequired') })}
                    className="text-start"
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive text-start">{errors.startDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-start block">
                    {t('endDate')}
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register('endDate')}
                    className="text-start"
                  />
                </div>
              </div>

              {/* Meeting URL */}
              <div className="space-y-2">
                <Label htmlFor="meetingUrl" className="text-start block">
                  {t('meetingUrl')}
                </Label>
                <Input
                  id="meetingUrl"
                  {...register('meetingUrl')}
                  placeholder={t('meetingUrlPlaceholder')}
                  className="text-start"
                />
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-start block">
                  {t('timezone')}
                </Label>
                <Input
                  id="timezone"
                  {...register('timezone')}
                  placeholder={t('timezonePlaceholder')}
                  defaultValue="UTC"
                  className="text-start"
                />
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-start block">
                  {t('capacity')}
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  {...register('capacity', { valueAsNumber: true })}
                  placeholder={t('capacityPlaceholder')}
                  className="text-start"
                />
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <Label htmlFor="eventTypeId" className="text-start block">
                  {t('eventTypeLabel')} *
                </Label>
                <Controller
                  name="eventTypeId"
                  control={control}
                  rules={{ required: t('eventTypeRequired', { defaultValue: 'Event type is required' }) }}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : undefined}
                      disabled={eventTypesLoading}
                    >
                      <SelectTrigger className="text-start" id="eventTypeId">
                        <SelectValue placeholder={t('eventTypePlaceholder', { defaultValue: 'Select event type' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypesLoading ? (
                          <SelectItem value="loading" disabled>
                            {t('loading', { defaultValue: 'Loading...' })}
                          </SelectItem>
                        ) : eventTypes && eventTypes.length > 0 ? (
                          eventTypes.map((eventType) => (
                            <SelectItem key={eventType.id} value={String(eventType.id)}>
                              {locale === 'ar' && eventType.nameAr ? eventType.nameAr : eventType.nameEn}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            {t('noOptions', { defaultValue: 'No options available' })}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.eventTypeId && (
                  <p className="text-sm text-destructive text-start">{errors.eventTypeId.message}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="statusId" className="text-start block">
                  {t('statusLabel')} *
                </Label>
                <Controller
                  name="statusId"
                  control={control}
                  rules={{ required: t('statusRequired', { defaultValue: 'Status is required' }) }}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : undefined}
                      disabled={eventStatusesLoading}
                    >
                      <SelectTrigger className="text-start" id="statusId">
                        <SelectValue placeholder={t('statusPlaceholder', { defaultValue: 'Select status' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {eventStatusesLoading ? (
                          <SelectItem value="loading" disabled>
                            {t('loading', { defaultValue: 'Loading...' })}
                          </SelectItem>
                        ) : eventStatuses && eventStatuses.length > 0 ? (
                          eventStatuses.map((status) => (
                            <SelectItem key={status.id} value={String(status.id)}>
                              {locale === 'ar' && status.nameAr ? status.nameAr : status.nameEn}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            {t('noOptions', { defaultValue: 'No options available' })}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.statusId && (
                  <p className="text-sm text-destructive text-start">{errors.statusId.message}</p>
                )}
              </div>

              {/* Category - Optional (based on database schema: categoryId is nullable) */}
              <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-start block">
                  {t('categoryLabel', { defaultValue: 'Category' })}
                </Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(value && value !== 'none' ? Number(value) : undefined)}
                      value={field.value ? String(field.value) : 'none'}
                      disabled={eventCategoriesLoading}
                    >
                      <SelectTrigger className="text-start" id="categoryId">
                        <SelectValue placeholder={t('categoryPlaceholder', { defaultValue: 'Select category (optional)' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCategoriesLoading ? (
                          <SelectItem value="loading" disabled>
                            {t('loading', { defaultValue: 'Loading...' })}
                          </SelectItem>
                        ) : eventCategories && eventCategories.length > 0 ? (
                          <>
                            <SelectItem value="none">{t('noCategory', { defaultValue: 'No category' })}</SelectItem>
                            {eventCategories.map((category) => (
                              <SelectItem key={category.id} value={String(category.id)}>
                                {locale === 'ar' && category.nameAr ? category.nameAr : category.nameEn}
                              </SelectItem>
                            ))}
                          </>
                        ) : (
                          <SelectItem value="none">{t('noCategory', { defaultValue: 'No category' })}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-muted-foreground text-start">
                  {t('categoryHint', { defaultValue: 'Select a category for your event (optional)' })}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-2 pt-4">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                {t('previous')}
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel', { defaultValue: 'Cancel' })}
              </Button>
            )}

            {step < 2 ? (
              <Button type="button" onClick={nextStep}>
                {t('next')}
              </Button>
            ) : (
              <Button type="submit" disabled={createEventMutation.isPending} className="gap-2">
                {createEventMutation.isPending ? (
                  <>
                    <Calendar className="h-4 w-4 animate-pulse" />
                    {t('creating', { defaultValue: 'Creating...' })}
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    {t('createButton')}
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
