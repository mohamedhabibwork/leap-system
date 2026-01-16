'use client';

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
import { useCreateJob } from '@/lib/hooks/use-api';
import type { CreateJobDto } from '@/lib/api/jobs';
import { LookupTypeCode } from '@leap-lms/shared-types';
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { generateUniqueSlug } from '@/lib/utils/slug';
import { Briefcase } from 'lucide-react';

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: number;
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
export function CreateJobModal({ open, onOpenChange, companyId }: CreateJobModalProps) {
  const t = useTranslations('common.create.job');
  const params = useParams();
  const locale = (params.locale as 'en' | 'ar') || 'en';
  const createJobMutation = useCreateJob();
  
  // Fetch lookup data
  const { data: jobTypes, isLoading: jobTypesLoading } = useLookupsByType(LookupTypeCode.JOB_TYPE);
  const { data: experienceLevels, isLoading: experienceLevelsLoading } = useLookupsByType(LookupTypeCode.EXPERIENCE_LEVEL);
  const { data: jobStatuses, isLoading: jobStatusesLoading } = useLookupsByType(LookupTypeCode.JOB_STATUS);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateJobDto>({
    defaultValues: {
      jobTypeId: undefined,
      experienceLevelId: undefined,
      statusId: undefined,
    },
  });

  const onSubmit = async (data: CreateJobDto) => {
    try {
      // Validate required lookup fields
      if (!data.jobTypeId || !data.experienceLevelId || !data.statusId) {
        return; // Validation errors will be shown by react-hook-form
      }

      // Generate unique slug from title
      const slug = generateUniqueSlug(data.titleEn);

      // Prepare job data with required fields
      const jobData: CreateJobDto = {
        titleEn: data.titleEn,
        slug,
        descriptionEn: data.descriptionEn,
        jobTypeId: data.jobTypeId,
        experienceLevelId: data.experienceLevelId,
        statusId: data.statusId,
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

          {/* Job Type */}
          <div className="space-y-2">
            <Label htmlFor="jobTypeId" className="text-start block">
              {t('jobTypeLabel')} *
            </Label>
            <Controller
              name="jobTypeId"
              control={control}
              rules={{ required: t('jobTypeRequired') }}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                  disabled={jobTypesLoading}
                >
                  <SelectTrigger className="text-start" id="jobTypeId">
                    <SelectValue placeholder={t('jobTypePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypesLoading ? (
                      <SelectItem value="loading" disabled>
                        {t('loading')}
                      </SelectItem>
                    ) : jobTypes && jobTypes.length > 0 ? (
                      jobTypes.map((jobType) => (
                        <SelectItem key={jobType.id} value={String(jobType.id)}>
                          {locale === 'ar' && jobType.nameAr ? jobType.nameAr : jobType.nameEn}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>
                        {t('noOptions')}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.jobTypeId && (
              <p className="text-sm text-destructive text-start">{errors.jobTypeId.message}</p>
            )}
          </div>

          {/* Location, Experience Level, Status & Salary */}
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
              <Label htmlFor="experienceLevelId" className="text-start block">
                {t('experienceLevelLabel')} *
              </Label>
              <Controller
                name="experienceLevelId"
                control={control}
                rules={{ required: t('experienceLevelRequired') }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                    disabled={experienceLevelsLoading}
                  >
                    <SelectTrigger className="text-start" id="experienceLevelId">
                      <SelectValue placeholder={t('experienceLevelPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevelsLoading ? (
                        <SelectItem value="loading" disabled>
                          {t('loading')}
                        </SelectItem>
                      ) : experienceLevels && experienceLevels.length > 0 ? (
                        experienceLevels.map((level) => (
                          <SelectItem key={level.id} value={String(level.id)}>
                            {locale === 'ar' && level.nameAr ? level.nameAr : level.nameEn}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          {t('noOptions')}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.experienceLevelId && (
                <p className="text-sm text-destructive text-start">{errors.experienceLevelId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="statusId" className="text-start block">
                {t('statusLabel')} *
              </Label>
              <Controller
                name="statusId"
                control={control}
                rules={{ required: t('statusRequired') }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                    disabled={jobStatusesLoading}
                  >
                    <SelectTrigger className="text-start" id="statusId">
                      <SelectValue placeholder={t('statusPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {jobStatusesLoading ? (
                        <SelectItem value="loading" disabled>
                          {t('loading')}
                        </SelectItem>
                      ) : jobStatuses && jobStatuses.length > 0 ? (
                        jobStatuses.map((status) => (
                          <SelectItem key={status.id} value={String(status.id)}>
                            {locale === 'ar' && status.nameAr ? status.nameAr : status.nameEn}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          {t('noOptions')}
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
