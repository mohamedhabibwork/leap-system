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
import { useCreateEvent } from '@/lib/hooks/use-api';
import type { CreateEventDto } from '@/lib/api/events';
import { Calendar, MapPin, Upload } from 'lucide-react';

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
  const [step, setStep] = useState(1);
  const createEventMutation = useCreateEvent();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateEventDto>();

  const onSubmit = async (data: CreateEventDto) => {
    try {
      // Generate slug from title
      const slug = data.titleEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Prepare event data with required fields
      const eventData: CreateEventDto = {
        titleEn: data.titleEn,
        slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        descriptionEn: data.descriptionEn,
        eventTypeId: 1, // Default to first event type - TODO: make this configurable
        statusId: 1, // Default to first status (likely "draft" or "active")
        categoryId: data.categoryId,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        timezone: data.timezone || 'UTC',
        meetingUrl: data.meetingUrl,
        capacity: data.capacity,
      };

      await createEventMutation.mutateAsync(eventData);
      onOpenChange(false);
      setStep(1);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-start">Create New Event</DialogTitle>
          <DialogDescription className="text-start">
            Step {step} of 2: {step === 1 ? 'Basic Information' : 'Details & Capacity'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="titleEn" className="text-start block">
                  Event Title *
                </Label>
                <Input
                  id="titleEn"
                  {...register('titleEn', { required: 'Title is required' })}
                  placeholder="Enter event title"
                  className="text-start"
                />
                {errors.titleEn && (
                  <p className="text-sm text-destructive text-start">{errors.titleEn.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="descriptionEn" className="text-start block">
                  Description
                </Label>
                <Textarea
                  id="descriptionEn"
                  {...register('descriptionEn')}
                  placeholder="Describe your event..."
                  rows={5}
                  className="text-start resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-start block">
                  Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="Enter location or meeting link"
                    className="ps-10 text-start"
                  />
                </div>
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
                    Start Date & Time *
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
                    End Date & Time
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
                  Meeting URL (for online events)
                </Label>
                <Input
                  id="meetingUrl"
                  {...register('meetingUrl')}
                  placeholder="https://zoom.us/j/..."
                  className="text-start"
                />
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-start block">
                  Timezone
                </Label>
                <Input
                  id="timezone"
                  {...register('timezone')}
                  placeholder="UTC, America/New_York, etc."
                  defaultValue="UTC"
                  className="text-start"
                />
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-start block">
                  Maximum Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  {...register('capacity', { valueAsNumber: true })}
                  placeholder="Leave empty for unlimited"
                  className="text-start"
                />
              </div>

              {/* Category ID - TODO: Replace with category selector */}
              <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-start block">
                  Category ID (optional)
                </Label>
                <Input
                  id="categoryId"
                  type="number"
                  {...register('categoryId', { valueAsNumber: true })}
                  placeholder="Enter category ID"
                  className="text-start"
                />
                <p className="text-xs text-muted-foreground text-start">
                  Leave empty if no specific category
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-2 pt-4">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}

            {step < 2 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={createEventMutation.isPending} className="gap-2">
                {createEventMutation.isPending ? (
                  <>
                    <Calendar className="h-4 w-4 animate-pulse" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Create Event
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
