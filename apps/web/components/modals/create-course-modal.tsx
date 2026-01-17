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
import type { CreateCourseDto } from '@/lib/api/courses';
import { GraduationCap, Upload } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { LookupTypeCode } from '@leap-lms/shared-types';
import apiClient from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * CreateCourseModal Component
 * Multi-step form for creating courses
 * 
 * RTL/LTR Support:
 * - All form elements aligned with text-start
 * - Multi-step navigation flows correctly
 * 
 * Theme Support:
 * - Form controls adapt to theme
 * - All text uses theme-aware colors
 */
export function CreateCourseModal({ open, onOpenChange }: CreateCourseModalProps) {
  const t = useTranslations('common.create.course');
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { data: courseStatuses, isLoading: isLoadingStatuses } = useLookupsByType(LookupTypeCode.COURSE_STATUS);
  const queryClient = useQueryClient();
  
  const createCourseMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/lms/courses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Course created successfully');
      onOpenChange(false);
      setStep(1);
    },
    onError: () => {
      toast.error('Failed to create course');
    },
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCourseDto>({
    defaultValues: {
      currency: 'USD',
      level: 'beginner',
    },
  });

  // Generate slug from title
  const title = watch('title');
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const onSubmit = async (data: CreateCourseDto) => {
    try {
      // Get draft status ID
      const draftStatus = courseStatuses?.find((s: any) => s.code === 'draft');
      if (!draftStatus) {
        throw new Error('Draft status not found');
      }

      // Get current user ID
      const instructorId = user?.id;
      if (!instructorId) {
        throw new Error('User not authenticated');
      }

      // Transform frontend DTO to backend DTO format
      const backendData: any = {
        titleEn: data.title,
        slug: generateSlug(data.title),
        descriptionEn: data.description,
        instructorId: instructorId,
        statusId: draftStatus.id,
      };

      // Add optional fields only if they have values
      if (data.price !== undefined && data.price !== null) {
        backendData.price = data.price;
      }
      if (data.thumbnail) {
        backendData.thumbnailUrl = data.thumbnail;
      }
      if (data.duration !== undefined && data.duration !== null) {
        backendData.durationHours = data.duration;
      }

      // Add tags if provided
      if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        backendData.tags = data.tags;
      }

      // Add requirements if provided
      if (data.requirements && Array.isArray(data.requirements) && data.requirements.length > 0) {
        backendData.requirements = data.requirements;
      }

      // Add learning outcomes if provided
      if (data.learningOutcomes && Array.isArray(data.learningOutcomes) && data.learningOutcomes.length > 0) {
        backendData.learningOutcomes = data.learningOutcomes;
      }

      await createCourseMutation.mutateAsync(backendData);
    } catch (error) {
      // Error handled in mutation
      console.error('Failed to create course:', error);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-start">{t('title')}</DialogTitle>
          <DialogDescription className="text-start">
            {t('step', { step })}: {step === 1 ? t('basicInfo') : t('pricingDetails')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-start block">
                  {t('courseTitle')} *
                </Label>
                <Input
                  id="title"
                  {...register('title', { required: t('titleRequired') })}
                  placeholder={t('courseTitlePlaceholder')}
                  className="text-start"
                />
                {errors.title && (
                  <p className="text-sm text-destructive text-start">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-start block">
                  {t('descriptionLabel')} *
                </Label>
                <Textarea
                  id="description"
                  {...register('description', { required: t('descriptionRequired') })}
                  placeholder={t('descriptionPlaceholder')}
                  rows={6}
                  className="text-start resize-none"
                />
                {errors.description && (
                  <p className="text-sm text-destructive text-start">{errors.description.message}</p>
                )}
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="text-start block">
                  {t('thumbnailLabel')}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="thumbnail"
                    {...register('thumbnail')}
                    placeholder={t('thumbnailPlaceholder')}
                    className="text-start"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label className="text-start block">{t('levelLabel')} *</Label>
                <Select
                  onValueChange={(value) => setValue('level', value )}
                  defaultValue="beginner"
                >
                  <SelectTrigger className="text-start">
                    <SelectValue placeholder={t('levelPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t('levels.beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('levels.intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('levels.advanced')}</SelectItem>
                    <SelectItem value="expert">{t('levels.expert')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Details */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-start block">
                    {t('priceLabel')} *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', { 
                      required: t('priceRequired'),
                      valueAsNumber: true 
                    })}
                    placeholder={t('pricePlaceholder')}
                    className="text-start"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive text-start">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-start block">
                    {t('currencyLabel')} *
                  </Label>
                  <Input
                    id="currency"
                    {...register('currency', { required: t('currencyRequired') })}
                    placeholder={t('currencyPlaceholder')}
                    defaultValue="USD"
                    className="text-start"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-start block">
                  {t('durationLabel')}
                </Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  placeholder={t('durationPlaceholder')}
                  className="text-start"
                />
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-start block">
                  {t('requirementsLabel')}
                </Label>
                <Textarea
                  id="requirements"
                  placeholder={t('requirementsPlaceholder')}
                  rows={4}
                  className="text-start resize-none"
                  onChange={(e) => {
                    const requirements = e.target.value.split('\n').filter(Boolean);
                    setValue('requirements', requirements);
                  }}
                />
              </div>

              {/* Learning Outcomes */}
              <div className="space-y-2">
                <Label htmlFor="learningOutcomes" className="text-start block">
                  {t('learningOutcomesLabel')}
                </Label>
                <Textarea
                  id="learningOutcomes"
                  placeholder={t('learningOutcomesPlaceholder')}
                  rows={4}
                  className="text-start resize-none"
                  onChange={(e) => {
                    const outcomes = e.target.value.split('\n').filter(Boolean);
                    setValue('learningOutcomes', outcomes);
                  }}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-start block">
                  {t('tagsLabel')}
                </Label>
                <Input
                  id="tags"
                  placeholder={t('tagsPlaceholder')}
                  className="text-start"
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                    setValue('tags', tags);
                  }}
                />
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
              <Button 
                type="submit" 
                disabled={createCourseMutation.isPending || isLoadingStatuses || !courseStatuses} 
                className="gap-2"
              >
                {createCourseMutation.isPending ? (
                  <>
                    <GraduationCap className="h-4 w-4 animate-pulse" />
                    {t('creating')}
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4" />
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
