'use client';

import { useState } from 'react';
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
      toast.success('Page created successfully!');
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error('Failed to create page');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-start">Create Page</DialogTitle>
          <DialogDescription className="text-start">
            Create a page for your business, brand, organization, or community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-start block">
              Page Name *
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'Page name is required' })}
              placeholder="Enter page name"
              className="text-start"
            />
            {errors.name && (
              <p className="text-sm text-destructive text-start">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-start block">
              Description
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your page..."
              rows={5}
              className="text-start resize-none"
            />
            <p className="text-xs text-muted-foreground text-start">
              Tell people what your page is about
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-start block">Category</Label>
            <Select
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger className="text-start">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="public_figure">Public Figure</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="nonprofit">Non-Profit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground text-start">
              Help people find your page by selecting the right category
            </p>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="coverImage" className="text-start block">
              Cover Image URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="coverImage"
                {...register('coverImage')}
                placeholder="https://..."
                className="text-start"
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-start">
              Add a cover image to make your page more professional
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
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPageMutation.isPending}
              className="gap-2"
            >
              {createPageMutation.isPending ? (
                <>
                  <FileText className="h-4 w-4 animate-pulse" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Create Page
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
