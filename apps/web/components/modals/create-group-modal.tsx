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
      toast.success('Group created successfully!');
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error('Failed to create group');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-start">Create Group</DialogTitle>
          <DialogDescription className="text-start">
            Create a community group to connect with people who share your interests
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-start block">
              Group Name *
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'Group name is required' })}
              placeholder="Enter group name"
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
              placeholder="Describe what your group is about..."
              rows={5}
              className="text-start resize-none"
            />
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
              Add a cover image to make your group more attractive
            </p>
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <Label className="text-start block">Privacy *</Label>
            <Select
              onValueChange={(value) => setValue('privacy', value as 'public' | 'private')}
              defaultValue="public"
            >
              <SelectTrigger className="text-start">
                <SelectValue placeholder="Select privacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="text-start">
                    <div className="font-medium">Public</div>
                    <div className="text-xs text-muted-foreground">
                      Anyone can see and join this group
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="text-start">
                    <div className="font-medium">Private</div>
                    <div className="text-xs text-muted-foreground">
                      Only members can see posts, requests required
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
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createGroupMutation.isPending}
              className="gap-2"
            >
              {createGroupMutation.isPending ? (
                <>
                  <Users className="h-4 w-4 animate-pulse" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Create Group
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
