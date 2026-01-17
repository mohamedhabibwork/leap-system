'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { coursesAPI, sectionsAPI, lessonsAPI, type CourseSection, type Lesson } from '@/lib/api/courses';
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { LookupTypeCode, Quiz } from '@leap-lms/shared-types';
import { useAuth } from '@/lib/contexts/auth-context';
import apiClient from '@/lib/api/client';
import { Assignment } from '@/lib/api/assignments';

interface CourseFormData {
  titleEn: string;
  titleAr?: string;
  descriptionEn: string;
  descriptionAr?: string;
  categoryId?: number;
  price?: number;
  durationHours?: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  requirements: string[];
  learningOutcomes: string[];
  tags: string[];
  sections: Array<{
    id?: number;
    titleEn: string;
    titleAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    displayOrder: number;
    lessons: Array<{
      id?: number;
      titleEn: string;
      titleAr?: string;
      descriptionEn?: string;
      descriptionAr?: string;
      contentEn?: string;
      contentAr?: string;
      contentTypeId: number;
      videoUrl?: string;
      attachmentUrl?: string;
      durationMinutes?: number;
      displayOrder: number;
      isPreview: boolean;
    }>;
  }>;
}

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const courseIdParam = params?.id as string;
  const courseId = courseIdParam && courseIdParam !== 'new' ? Number(courseIdParam) : null;
  const isEdit = courseId !== null && !isNaN(courseId);

  const [deleteSectionId, setDeleteSectionId] = useState<number | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);
  const [deleteLessonSectionId, setDeleteLessonSectionId] = useState<number | null>(null);

  const { data: courseStatuses } = useLookupsByType(LookupTypeCode.COURSE_STATUS);
  const { data: contentTypeLookups } = useLookupsByType(LookupTypeCode.CONTENT_TYPE);

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesAPI.getById(courseId!),
    enabled: isEdit,
  });

  const { data: sections, isLoading: isLoadingSections } = useQuery({
    queryKey: ['sections', courseId],
    queryFn: () => sectionsAPI.getByCourse(courseId!),
    enabled: isEdit,
  });

  const { data: allLessons } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      if (!sections) return [];
      const lessonsPromises = sections.map((section) =>
        lessonsAPI.getBySection(section.id).then((response) => ({
          sectionId: section.id,
          lessons: response.lessons || [],
          assignments: response.assignments as Assignment[],
          quizzes: response.quizzes as Quiz[],
        }))
      );
      return Promise.all(lessonsPromises);
    },
    enabled: isEdit && !!sections,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CourseFormData>({
    defaultValues: {
      titleEn: '',
      descriptionEn: '',
      requirements: [],
      learningOutcomes: [],
      tags: [],
      sections: [],
    },
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection, update: updateSection } = useFieldArray({
    control,
    name: 'sections',
  });

  const removeLessonFromSection = (sectionIndex: number, lessonIndex: number) => {
    const section = sectionFields[sectionIndex];
    const updatedLessons = section.lessons?.filter((_, idx) => idx !== lessonIndex) || [];
    updateSection(sectionIndex, {
      ...section,
      lessons: updatedLessons,
    });
  };

  useEffect(() => {
    if (course && sections && allLessons) {
      const sectionsWithLessons = sections.map((section) => {
        const sectionLessons = allLessons.find((l) => l.sectionId === section.id)?.lessons || [];
        return {
          id: section.id,
          titleEn: section.titleEn,
          titleAr: section.titleAr,
          descriptionEn: section.descriptionEn,
          descriptionAr: section.descriptionAr,
          displayOrder: section.displayOrder,
          lessons: sectionLessons.map((lesson) => ({
            id: lesson.id,
            titleEn: lesson.titleEn,
            titleAr: lesson.titleAr,
            descriptionEn: lesson.descriptionEn,
            descriptionAr: lesson.descriptionAr,
            contentEn: lesson.contentEn,
            contentAr: lesson.contentAr,
            contentTypeId: lesson.contentTypeId,
            videoUrl: lesson.videoUrl,
            attachmentUrl: lesson.attachmentUrl,
            durationMinutes: lesson.durationMinutes,
            displayOrder: lesson.displayOrder,
            isPreview: lesson.isPreview,
          })),
        };
      });

      reset({
        titleEn: course.titleEn || '',
        titleAr: course.titleAr,
        descriptionEn: course.descriptionEn || '',
        descriptionAr: course.descriptionAr,
        categoryId: course.categoryId,
        price: course.price ? Number(course.price) : undefined,
        durationHours: course.durationHours,
        thumbnailUrl: course.thumbnailUrl,
        videoUrl: course.videoUrl,
        requirements: course.requirements || [],
        learningOutcomes: course.learningOutcomes || [],
        tags: course.tags || [],
        sections: sectionsWithLessons.sort((a, b) => a.displayOrder - b.displayOrder),
      });
    }
  }, [course, sections, allLessons, reset]);

  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const draftStatus = courseStatuses?.find((s: any) => s.code === 'draft');
      if (!draftStatus) throw new Error('Draft status not found');
      if (!user?.id) throw new Error('User not authenticated');

      const courseData = {
        titleEn: data.titleEn,
        slug: generateSlug(data.titleEn),
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        instructorId: user.id,
        statusId: draftStatus.id,
        categoryId: data.categoryId,
        price: data.price,
        durationHours: data.durationHours,
        thumbnailUrl: data.thumbnailUrl,
        videoUrl: data.videoUrl,
        requirements: data.requirements,
        learningOutcomes: data.learningOutcomes,
        tags: data.tags,
      };

      return apiClient.post('/lms/courses', courseData);
    },
    onSuccess: async (newCourse: any) => {
      // Create sections and lessons
      for (const section of sectionFields) {
        const sectionData = {
          courseId: newCourse.id,
          titleEn: section.titleEn,
          titleAr: section.titleAr,
          descriptionEn: section.descriptionEn,
          descriptionAr: section.descriptionAr,
          displayOrder: section.displayOrder,
        };
        const createdSection = await sectionsAPI.create(sectionData);

        // Create lessons for this section
        if (section.lessons && section.lessons.length > 0) {
          for (const lesson of section.lessons) {
            await lessonsAPI.create({
              sectionId: createdSection.id,
              contentTypeId: lesson.contentTypeId,
              titleEn: lesson.titleEn,
              titleAr: lesson.titleAr,
              descriptionEn: lesson.descriptionEn,
              descriptionAr: lesson.descriptionAr,
              contentEn: lesson.contentEn,
              contentAr: lesson.contentAr,
              videoUrl: lesson.videoUrl,
              attachmentUrl: lesson.attachmentUrl,
              durationMinutes: lesson.durationMinutes,
              displayOrder: lesson.displayOrder,
              isPreview: lesson.isPreview,
            });
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully');
      router.push(`/admin/courses/${newCourse.id}`);
    },
    onError: () => {
      toast.error('Failed to create course');
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const updateData: any = {
        titleEn: data.titleEn,
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        categoryId: data.categoryId,
        price: data.price,
        durationHours: data.durationHours,
        thumbnailUrl: data.thumbnailUrl,
        videoUrl: data.videoUrl,
      };
      return coursesAPI.update(courseId!, updateData);
    },
    onSuccess: async () => {
      // Update sections and lessons
      for (const section of sectionFields) {
        if (section.id) {
          // Update existing section
          await sectionsAPI.update(section.id, {
            titleEn: section.titleEn,
            titleAr: section.titleAr,
            descriptionEn: section.descriptionEn,
            descriptionAr: section.descriptionAr,
            displayOrder: section.displayOrder,
          });
        } else {
          // Create new section
          const createdSection = await sectionsAPI.create({
            courseId: courseId!,
            titleEn: section.titleEn,
            titleAr: section.titleAr,
            descriptionEn: section.descriptionEn,
            descriptionAr: section.descriptionAr,
            displayOrder: section.displayOrder,
          });
          section.id = createdSection.id;
        }

        // Handle lessons
        if (section.lessons && section.lessons.length > 0) {
          for (const lesson of section.lessons) {
            if (lesson.id) {
              // Update existing lesson
              await lessonsAPI.update(lesson.id, {
                titleEn: lesson.titleEn,
                titleAr: lesson.titleAr,
                descriptionEn: lesson.descriptionEn,
                descriptionAr: lesson.descriptionAr,
                contentEn: lesson.contentEn,
                contentAr: lesson.contentAr,
                contentTypeId: lesson.contentTypeId,
                videoUrl: lesson.videoUrl,
                attachmentUrl: lesson.attachmentUrl,
                durationMinutes: lesson.durationMinutes,
                displayOrder: lesson.displayOrder,
                isPreview: lesson.isPreview,
              });
            } else {
              // Create new lesson
              await lessonsAPI.create({
                sectionId: section.id!,
                contentTypeId: lesson.contentTypeId,
                titleEn: lesson.titleEn,
                titleAr: lesson.titleAr,
                descriptionEn: lesson.descriptionEn,
                descriptionAr: lesson.descriptionAr,
                contentEn: lesson.contentEn,
                contentAr: lesson.contentAr,
                videoUrl: lesson.videoUrl,
                attachmentUrl: lesson.attachmentUrl,
                durationMinutes: lesson.durationMinutes,
                displayOrder: lesson.displayOrder,
                isPreview: lesson.isPreview,
              });
            }
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      toast.success('Course updated successfully');
    },
    onError: () => {
      toast.error('Failed to update course');
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => sectionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', courseId] });
      toast.success('Section deleted successfully');
      setDeleteSectionId(null);
    },
    onError: () => {
      toast.error('Failed to delete section');
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: number) => lessonsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      toast.success('Lesson deleted successfully');
      setDeleteLessonId(null);
      setDeleteLessonSectionId(null);
    },
    onError: () => {
      toast.error('Failed to delete lesson');
    },
  });

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const onSubmit = async (data: CourseFormData) => {
    if (isEdit) {
      await updateCourseMutation.mutateAsync(data);
    } else {
      await createCourseMutation.mutateAsync(data);
    }
  };

  const addSection = () => {
    const maxOrder = sectionFields.length > 0
      ? Math.max(...sectionFields.map((s) => s.displayOrder || 0))
      : 0;
    appendSection({
      titleEn: '',
      displayOrder: maxOrder + 1,
      lessons: [],
    });
  };

  const addLesson = (sectionIndex: number) => {
    const section = sectionFields[sectionIndex];
    const maxOrder = section.lessons && section.lessons.length > 0
      ? Math.max(...section.lessons.map((l) => l.displayOrder || 0))
      : 0;
    
    const currentLessons = section.lessons || [];
    updateSection(sectionIndex, {
      ...section,
      lessons: [
        ...currentLessons,
        {
          titleEn: '',
          contentTypeId: contentTypeLookups?.[0]?.id || 1,
          displayOrder: maxOrder + 1,
          isPreview: false,
        },
      ],
    });
  };

  if (isEdit && (isLoadingCourse || isLoadingSections)) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Edit Course' : 'Create Course'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEdit ? 'Update course details, sections, and lessons' : 'Create a new course with sections and lessons'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || createCourseMutation.isPending || updateCourseMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting || createCourseMutation.isPending || updateCourseMutation.isPending
            ? 'Saving...'
            : 'Save Course'}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titleEn">Title (English) *</Label>
                <Input
                  id="titleEn"
                  {...register('titleEn', { required: 'Title is required' })}
                  placeholder="Course Title"
                />
                {errors.titleEn && (
                  <p className="text-sm text-destructive">{errors.titleEn.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleAr">Title (Arabic)</Label>
                <Input
                  id="titleAr"
                  {...register('titleAr')}
                  placeholder="عنوان الدورة"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descriptionEn">Description (English) *</Label>
                <Textarea
                  id="descriptionEn"
                  {...register('descriptionEn', { required: 'Description is required' })}
                  placeholder="Course Description"
                  rows={4}
                />
                {errors.descriptionEn && (
                  <p className="text-sm text-destructive">{errors.descriptionEn.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                <Textarea
                  id="descriptionAr"
                  {...register('descriptionAr')}
                  placeholder="وصف الدورة"
                  rows={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationHours">Duration (Hours)</Label>
                <Input
                  id="durationHours"
                  type="number"
                  {...register('durationHours', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Input
                  id="categoryId"
                  type="number"
                  {...register('categoryId', { valueAsNumber: true })}
                  placeholder="Category ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  {...register('thumbnailUrl')}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  {...register('videoUrl')}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections and Lessons */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sections & Lessons</CardTitle>
              <Button type="button" onClick={addSection} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {sectionFields.map((section, sectionIndex) => (
                <AccordionItem key={section.id || `section-${sectionIndex}`} value={`section-${sectionIndex}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 flex-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {section.titleEn || `Section ${sectionIndex + 1}`}
                      </span>
                      {section.lessons && section.lessons.length > 0 && (
                        <Badge variant="secondary">{section.lessons.length} lessons</Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Section Title (English) *</Label>
                          <Input
                            {...register(`sections.${sectionIndex}.titleEn`, {
                              required: 'Section title is required',
                            })}
                            placeholder="Section Title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Section Title (Arabic)</Label>
                          <Input
                            {...register(`sections.${sectionIndex}.titleAr`)}
                            placeholder="عنوان القسم"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Description (English)</Label>
                          <Textarea
                            {...register(`sections.${sectionIndex}.descriptionEn`)}
                            placeholder="Section Description"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (Arabic)</Label>
                          <Textarea
                            {...register(`sections.${sectionIndex}.descriptionAr`)}
                            placeholder="وصف القسم"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Lessons</Label>
                        <Button
                          type="button"
                          onClick={() => addLesson(sectionIndex)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Lesson
                        </Button>
                      </div>

                      {section.lessons && section.lessons.length > 0 && (
                        <div className="space-y-3">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <Card key={lesson.id || `lesson-${lessonIndex}`}>
                              <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {lesson.titleEn || `Lesson ${lessonIndex + 1}`}
                                    </span>
                                    {lesson.isPreview && (
                                      <Badge variant="outline">Preview</Badge>
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (lesson.id) {
                                        setDeleteLessonId(lesson.id);
                                        setDeleteLessonSectionId(sectionIndex);
                                      } else {
                                        removeLessonFromSection(sectionIndex, lessonIndex);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Lesson Title (English) *</Label>
                                    <Input
                                      {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.titleEn`, {
                                        required: 'Lesson title is required',
                                      })}
                                      placeholder="Lesson Title"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Lesson Title (Arabic)</Label>
                                    <Input
                                      {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.titleAr`)}
                                      placeholder="عنوان الدرس"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Content Type *</Label>
                                    <Select
                                      value={watch(`sections.${sectionIndex}.lessons.${lessonIndex}.contentTypeId`)?.toString() || ''}
                                      onValueChange={(value) =>
                                        setValue(`sections.${sectionIndex}.lessons.${lessonIndex}.contentTypeId`, Number(value))
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select content type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {contentTypeLookups?.map((type: any) => (
                                          <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.nameEn}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Duration (Minutes)</Label>
                                    <Input
                                      type="number"
                                      {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.durationMinutes`, {
                                        valueAsNumber: true,
                                      })}
                                      placeholder="0"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Video URL</Label>
                                    <Input
                                      {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.videoUrl`)}
                                      placeholder="https://example.com/video.mp4"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Attachment URL</Label>
                                    <Input
                                      {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.attachmentUrl`)}
                                      placeholder="https://example.com/file.pdf"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Content (English)</Label>
                                    <Textarea
                                      {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.contentEn`)}
                                      placeholder="Lesson content"
                                      rows={4}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Content (Arabic)</Label>
                                    <Textarea
                                      {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.contentAr`)}
                                      placeholder="محتوى الدرس"
                                      rows={4}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`preview-${sectionIndex}-${lessonIndex}`}
                                    {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.isPreview`)}
                                    className="rounded"
                                  />
                                  <Label htmlFor={`preview-${sectionIndex}-${lessonIndex}`} className="cursor-pointer">
                                    Mark as preview lesson
                                  </Label>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (section.id) {
                              setDeleteSectionId(section.id);
                            } else {
                              removeSection(sectionIndex);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Section
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {sectionFields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No sections yet. Click &quot;Add Section&quot; to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </form>

      {/* Delete Section Dialog */}
      <AlertDialog open={deleteSectionId !== null} onOpenChange={() => setDeleteSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this section? This will also delete all lessons in this section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteSectionId) {
                  deleteSectionMutation.mutate(deleteSectionId);
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lesson Dialog */}
      <AlertDialog open={deleteLessonId !== null} onOpenChange={() => {
        setDeleteLessonId(null);
        setDeleteLessonSectionId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteLessonId) {
                  deleteLessonMutation.mutate(deleteLessonId);
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
