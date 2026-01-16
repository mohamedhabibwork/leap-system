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
import { Users, Upload } from 'lucide-react';
import { toast } from 'sonner';

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

  const onSubmit = async (data: CreateGroupDto) => {
    try {
      await createGroupMutation.mutateAsync(data);
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
