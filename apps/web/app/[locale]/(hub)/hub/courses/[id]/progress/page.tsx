'use client';

import { use } from 'react';
import { useCourseLearningData } from '@/lib/hooks/use-api';
import { useCourseDetailedProgress } from '@/hooks/use-course-detailed-progress';
import { useCourseCertificate } from '@/hooks/use-certificates';
import { PageLoader } from '@/components/loading/page-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/courses/progress-ring';
import {
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  FileText,
  TrendingUp,
  Calendar,
  ArrowLeft,
  PlayCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api/client';
import Image from 'next/image';

export default function CourseProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('courses.progress');
  const router = useRouter();
  const { id } = use(params);
  const courseId = parseInt(id);

  // Fetch complete learning data in a single optimized request
  const { data: learningData, isLoading: isLoadingLearningData } = useCourseLearningData(courseId);

  // Fetch detailed progress with sections (only when learning data is loaded)
  const { data: detailedProgress } = useCourseDetailedProgress(courseId);

  // Extract data from learning data
  const course = learningData?.course;
  const sections = learningData?.sections || [];
  const progressData = learningData?.progress;

  // Fetch certificate status (only when course is 100% complete)
  const { data: certificate } = useCourseCertificate(
    courseId,
    progressData?.progressPercentage === 100
  );

  if (isLoadingLearningData) {
    return <PageLoader message={t('loading')} />;
  }

  if (!course) {
    return <div>{t('courseNotFound')}</div>;
  }

  const courseData = course;
  const allLessons = sections.flatMap((section: any) => section.lessons || []);
  const allQuizzes = sections.flatMap((section: any) => {
    const sectionQuizzes = section.quizzes || [];
    const lessonQuizzes = (section.lessons || []).flatMap((lesson: any) => lesson.quizzes || []);
    return [...sectionQuizzes, ...lessonQuizzes];
  });

  const finalProgressData = progressData || {
    progressPercentage: 0,
    completedLessons: 0,
    totalLessons: allLessons.length,
    timeSpentMinutes: 0,
    lastAccessedAt: null,
  };

  const completedQuizzes = detailedProgress?.completedQuizzes || 0;
  const totalQuizzes = allQuizzes.length;
  const timeSpentHours = Math.floor(finalProgressData.timeSpentMinutes / 60);
  const timeSpentMinutes = finalProgressData.timeSpentMinutes % 60;

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Hero Section - Udemy Style */}
      <div className="bg-white dark:bg-background border-b border-gray-200 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/hub/courses/${courseId}`)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{courseData.title}</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">{t('progressOverview')}</p>
            </div>
          </div>

          {/* Course Thumbnail and Progress Overview - Udemy Style */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Course Info with Thumbnail */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden border border-gray-200 dark:border-border">
                <div className="flex flex-col sm:flex-row">
                  {courseData.thumbnail && (
                    <div className="relative w-full sm:w-48 h-48 sm:h-auto sm:aspect-video bg-black shrink-0">
                      <Image
                        src={courseData.thumbnail}
                        alt={courseData.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">{t('overallProgress')}</h2>
                        <div className="flex items-center gap-3">
                          <ProgressRing 
                            progress={finalProgressData.progressPercentage} 
                            size="lg"
                            className="shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                              {finalProgressData.progressPercentage.toFixed(0)}%
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {finalProgressData.completedLessons} of {finalProgressData.totalLessons} {t('lessons')} completed
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Progress value={finalProgressData.progressPercentage} className="h-2 mb-4" />
                    <Button
                      onClick={() => router.push(`/hub/courses/${courseId}/learn`)}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      {t('continueLearning', { defaultValue: 'Continue Learning' })}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Quick Stats - Udemy Style */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4 sm:p-6 border border-gray-200 dark:border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  {t('quickStats', { defaultValue: 'Quick Stats' })}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{t('lessons')}</span>
                    </div>
                    <span className="text-base font-bold text-foreground">
                      {finalProgressData.completedLessons}/{finalProgressData.totalLessons}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{t('quizzes')}</span>
                    </div>
                    <span className="text-base font-bold text-foreground">
                      {completedQuizzes}/{totalQuizzes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{t('timeSpent')}</span>
                    </div>
                    <span className="text-base font-bold text-foreground">
                      {timeSpentHours}h {timeSpentMinutes}m
                    </span>
                  </div>
                  {finalProgressData.progressPercentage === 100 && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-border">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                        <span className="text-sm text-muted-foreground">{t('certificate')}</span>
                      </div>
                      {certificate ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {t('pending', { defaultValue: 'Pending' })}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Certificate Status - Udemy Style */}
        {finalProgressData.progressPercentage === 100 && (
          <Card className="p-4 sm:p-6 mb-6 border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 sm:p-4 shrink-0">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">{t('courseCompleted')}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {certificate
                      ? t('certificateReady')
                      : t('certificateGenerating')}
                  </p>
                </div>
              </div>
              {certificate ? (
                <Button
                  onClick={() => router.push(`/hub/courses/${courseId}/certificate`)}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Award className="h-4 w-4 mr-2" />
                  {t('viewCertificate')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    apiClient
                      .post(`/lms/certificates/generate/${courseId}`)
                      .then(() => {
                        router.push(`/hub/courses/${courseId}/certificate`);
                      });
                  }}
                  className="w-full sm:w-auto"
                >
                  {t('generateCertificate')}
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Section Breakdown - Udemy Style */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{t('sectionBreakdown')}</h2>
            <Badge variant="outline" className="text-sm">
              {sections.length} {t('sections', { defaultValue: 'Sections' })}
            </Badge>
          </div>
          <div className="space-y-3">
            {sections.map((section: any) => {
              const sectionLessons = section.lessons || [];
              const sectionQuizzes = section.quizzes || [];
              const completedSectionLessons =
                detailedProgress?.sectionProgress?.[section.id]?.completedLessons || 0;
              const sectionProgress =
                sectionLessons.length > 0
                  ? (completedSectionLessons / sectionLessons.length) * 100
                  : 0;

              return (
                <Card key={section.id} className="p-4 sm:p-6 border border-gray-200 dark:border-border hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="shrink-0">
                      <ProgressRing 
                        progress={sectionProgress} size="md" 
                        className="shrink-0"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-foreground">{section.titleEn}</h3>
                        <Badge variant="outline" className="shrink-0 text-xs sm:text-sm">
                          {sectionProgress.toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                        {completedSectionLessons} of {sectionLessons.length} {t('lessons')} completed
                        {sectionQuizzes.length > 0 && (
                          <> • {sectionQuizzes.length} {t('quizzes')}</>
                        )}
                      </p>
                      <Progress value={sectionProgress} className="h-2" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Learning Stats - Udemy Style */}
        <Card className="p-4 sm:p-6 border border-gray-200 dark:border-border">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground">{t('learningStats')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-muted/30 border border-gray-200 dark:border-border">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3 shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-1">{t('lastAccessed')}</div>
                  <div className="font-bold text-sm sm:text-base text-foreground">
                    {finalProgressData.lastAccessedAt
                      ? format(new Date(finalProgressData.lastAccessedAt), 'PPp')
                      : t('never')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-muted/30 border border-gray-200 dark:border-border">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-3 shrink-0">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-1">{t('averageScore')}</div>
                  <div className="font-bold text-sm sm:text-base text-foreground">
                    {detailedProgress?.averageQuizScore
                      ? `${detailedProgress.averageQuizScore.toFixed(1)}%`
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
