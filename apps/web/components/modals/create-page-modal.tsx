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
import { useCreatePage } from '@/lib/hooks/use-api';
import type { CreatePageDto } from '@/lib/api/pages';
import { FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';

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
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CreatePageDto>();

  const onSubmit = async (data: CreatePageDto) => {
    try {
      await createPageMutation.mutateAsync(data);
      toast.success(t('success'));
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error(t('error'));
    }
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
            <div className="flex gap-2">
              <Input
                id="coverImage"
                {...register('coverImage')}
                placeholder={t('coverImagePlaceholder')}
                className="text-start"
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-start">
              {t('coverImageHint')}
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
