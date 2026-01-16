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
import { useCreateJob } from '@/lib/hooks/use-api';
import type { CreateJobDto } from '@/lib/api/jobs';
import { Briefcase } from 'lucide-react';

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
}

/**
 * CreateJobModal Component
 * Form for creating job postings
 * 
 * RTL/LTR Support:
 * - All form fields aligned with text-start
 * - Labels flow correctly in both directions
 * 
 * Theme Support:
 * - Form controls adapt to theme
 * - Text colors use theme variables
 */
export function CreateJobModal({ open, onOpenChange }: CreateJobModalProps) {
  const t = useTranslations('common.create.job');
  const createJobMutation = useCreateJob();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateJobDto>();

  const onSubmit = async (data: CreateJobDto) => {
    try {
      // Generate slug from title
      const slug = data.titleEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Prepare job data with required fields
      const jobData: CreateJobDto = {
        titleEn: data.titleEn,
        slug: `${slug}-${Date.now()}`,
        descriptionEn: data.descriptionEn,
        jobTypeId: 1, // Default - will be mapped from lookup
        experienceLevelId: 1, // Default - will be mapped from lookup  
        statusId: 1, // Default to 'open' status
        location: data.location,
        salaryRange: data.salaryRange,
        // companyId is optional - don't send if not provided
      };

      await createJobMutation.mutateAsync(jobData);
      onOpenChange(false);
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-start">{t('modalTitle')}</DialogTitle>
          <DialogDescription className="text-start">
            {t('modalDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="titleEn" className="text-start block">
              {t('jobTitle')} *
            </Label>
            <Input
              id="titleEn"
              {...register('titleEn', { required: t('jobTitleRequired') })}
              placeholder={t('jobTitlePlaceholder')}
              className="text-start"
            />
            {errors.titleEn && (
              <p className="text-sm text-destructive text-start">{errors.titleEn.message}</p>
            )}
          </div>


          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="descriptionEn" className="text-start block">
              {t('descriptionLabel')}
            </Label>
            <Textarea
              id="descriptionEn"
              {...register('descriptionEn')}
              placeholder={t('descriptionPlaceholder')}
              rows={6}
              className="text-start resize-none"
            />
          </div>

          {/* Location & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-start block">
                {t('locationLabel')}
              </Label>
              <Input
                id="location"
                {...register('location')}
                placeholder={t('locationPlaceholder')}
                className="text-start"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryRange" className="text-start block">
                {t('salaryLabel')}
              </Label>
              <Input
                id="salaryRange"
                {...register('salaryRange')}
                placeholder={t('salaryPlaceholder')}
                className="text-start"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button type="submit" disabled={createJobMutation.isPending} className="gap-2">
              {createJobMutation.isPending ? (
                <>
                  <Briefcase className="h-4 w-4 animate-pulse" />
                  {t('posting')}
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4" />
                  {t('postButton')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
