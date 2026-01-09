'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useCreateSession } from '@/lib/hooks/use-instructor-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { CreateSessionDto } from '@leap-lms/shared-types';

export default function NewSessionPage() {
  const router = useRouter();
  const { mutate: createSession, isPending } = useCreateSession();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    const sessionData: CreateSessionDto = {
      lessonId: parseInt(data.lessonId),
      titleEn: data.titleEn,
      titleAr: data.titleAr || undefined,
      sessionTypeId: parseInt(data.sessionTypeId),
      sessionType: 'live', // default
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      timezone: data.timezone || 'UTC',
      meetingUrl: data.meetingUrl || undefined,
      meetingPassword: data.meetingPassword || undefined,
      maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : undefined,
      descriptionEn: data.descriptionEn || undefined,
      descriptionAr: data.descriptionAr || undefined,
      statusId: 1, // Scheduled status - should be looked up from lookups table
    };

    createSession(sessionData, {
      onSuccess: () => {
        toast.success('Session scheduled successfully');
        router.push('/hub/instructor/sessions');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to schedule session');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/hub/instructor/sessions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule New Session</h1>
          <p className="text-muted-foreground mt-2">
            Create a live session for your students
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Lesson ID */}
          <div className="space-y-2">
            <Label htmlFor="lessonId">Lesson ID *</Label>
            <Input
              id="lessonId"
              type="number"
              {...register('lessonId', { required: 'Lesson ID is required' })}
            />
            {errors.lessonId && (
              <p className="text-sm text-red-500">{errors.lessonId.message as string}</p>
            )}
          </div>

          {/* Session Title */}
          <div className="space-y-2">
            <Label htmlFor="titleEn">Session Title (English) *</Label>
            <Input
              id="titleEn"
              {...register('titleEn', { required: 'Title is required' })}
            />
            {errors.titleEn && (
              <p className="text-sm text-red-500">{errors.titleEn.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="titleAr">Session Title (Arabic)</Label>
            <Input id="titleAr" {...register('titleAr')} />
          </div>

          {/* Session Type */}
          <div className="space-y-2">
            <Label htmlFor="sessionTypeId">Session Type ID *</Label>
            <Input
              id="sessionTypeId"
              type="number"
              {...register('sessionTypeId', { required: 'Session type is required' })}
            />
            {errors.sessionTypeId && (
              <p className="text-sm text-red-500">{errors.sessionTypeId.message as string}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter the lookup ID for session type (live, recorded, hybrid)
            </p>
          </div>

          {/* Date & Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register('startTime', { required: 'Start time is required' })}
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...register('endTime', { required: 'End time is required' })}
              />
              {errors.endTime && (
                <p className="text-sm text-red-500">{errors.endTime.message as string}</p>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              placeholder="UTC"
              {...register('timezone')}
            />
          </div>

          {/* Meeting Details */}
          <div className="space-y-2">
            <Label htmlFor="meetingUrl">Meeting URL</Label>
            <Input
              id="meetingUrl"
              type="url"
              placeholder="https://zoom.us/j/..."
              {...register('meetingUrl')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingPassword">Meeting Password</Label>
            <Input
              id="meetingPassword"
              {...register('meetingPassword')}
            />
          </div>

          {/* Max Attendees */}
          <div className="space-y-2">
            <Label htmlFor="maxAttendees">Max Attendees</Label>
            <Input
              id="maxAttendees"
              type="number"
              {...register('maxAttendees')}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="descriptionEn">Description (English)</Label>
            <Textarea
              id="descriptionEn"
              rows={4}
              {...register('descriptionEn')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionAr">Description (Arabic)</Label>
            <Textarea
              id="descriptionAr"
              rows={4}
              {...register('descriptionAr')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Scheduling...' : 'Schedule Session'}
            </Button>
            <Link href="/hub/instructor/sessions" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
