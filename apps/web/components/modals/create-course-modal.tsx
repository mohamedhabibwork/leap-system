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
import { useCreateCourse } from '@/lib/hooks/use-api';
import type { CreateCourseDto } from '@/lib/api/courses';
import { GraduationCap, Upload } from 'lucide-react';

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
  const [step, setStep] = useState(1);
  const createCourseMutation = useCreateCourse();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateCourseDto>({
    defaultValues: {
      currency: 'USD',
      level: 'beginner',
    },
  });

  const onSubmit = async (data: CreateCourseDto) => {
    try {
      await createCourseMutation.mutateAsync(data);
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
          <DialogTitle className="text-start">Create New Course</DialogTitle>
          <DialogDescription className="text-start">
            Step {step} of 2: {step === 1 ? 'Basic Information' : 'Pricing & Details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-start block">
                  Course Title *
                </Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g. Complete Web Development Bootcamp"
                  className="text-start"
                />
                {errors.title && (
                  <p className="text-sm text-destructive text-start">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-start block">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Describe what students will learn..."
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
                  Thumbnail URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="thumbnail"
                    {...register('thumbnail')}
                    placeholder="https://..."
                    className="text-start"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label className="text-start block">Course Level *</Label>
                <Select
                  onValueChange={(value) => setValue('level', value as any)}
                  defaultValue="beginner"
                >
                  <SelectTrigger className="text-start">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
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
                    Price *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', { 
                      required: 'Price is required',
                      valueAsNumber: true 
                    })}
                    placeholder="0.00"
                    className="text-start"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive text-start">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-start block">
                    Currency *
                  </Label>
                  <Input
                    id="currency"
                    {...register('currency', { required: true })}
                    placeholder="USD"
                    defaultValue="USD"
                    className="text-start"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-start block">
                  Duration (hours)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  placeholder="e.g. 40"
                  className="text-start"
                />
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-start block">
                  Requirements (one per line)
                </Label>
                <Textarea
                  id="requirements"
                  placeholder="Basic programming knowledge&#10;Access to a computer&#10;Willingness to learn"
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
                  What Students Will Learn (one per line)
                </Label>
                <Textarea
                  id="learningOutcomes"
                  placeholder="Build modern web applications&#10;Master React and Node.js&#10;Deploy to production"
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
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
                  placeholder="web development, javascript, react"
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
              <Button type="submit" disabled={createCourseMutation.isPending} className="gap-2">
                {createCourseMutation.isPending ? (
                  <>
                    <GraduationCap className="h-4 w-4 animate-pulse" />
                    Creating...
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4" />
                    Create Course
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
