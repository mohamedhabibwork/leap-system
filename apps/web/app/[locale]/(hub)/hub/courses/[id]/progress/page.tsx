'use client';

import { use } from 'react';
import { useCourse } from '@/lib/hooks/use-api';
import { useCourseProgress } from '@/hooks/use-course-progress';
import { useCourseDetailedProgress } from '@/hooks/use-course-detailed-progress';
import { useCourseCertificate } from '@/hooks/use-certificates';
import { PageLoader } from '@/components/loading/page-loader';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  FileText,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CourseProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('courses.progress');
  const router = useRouter();
  const { id } = use(params);
  const courseId = parseInt(id);

  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId);
  const { progress, isLoading: isLoadingProgress } = useCourseProgress(courseId);

  // Fetch detailed progress with sections
  const { data: detailedProgress } = useCourseDetailedProgress(courseId);

  // Fetch certificate status
  const { data: certificate } = useCourseCertificate(
    courseId,
    progress?.progressPercentage === 100
  );

  if (isLoadingCourse || isLoadingProgress) {
    return <PageLoader message={t('loading')} />;
  }

  if (!course) {
    return <div>{t('courseNotFound')}</div>;
  }

  const courseData = course as any;
  const sections = courseData.sections || [];
  const allLessons = sections.flatMap((section: any) => section.lessons || []);
  const allQuizzes = sections.flatMap((section: any) => section.quizzes || []);

  const progressData = progress || {
    progressPercentage: 0,
    completedLessons: 0,
    totalLessons: allLessons.length,
    timeSpentMinutes: 0,
    lastAccessedAt: null,
  };

  const completedQuizzes = detailedProgress?.completedQuizzes || 0;
  const totalQuizzes = allQuizzes.length;
  const timeSpentHours = Math.floor(progressData.timeSpentMinutes / 60);
  const timeSpentMinutes = progressData.timeSpentMinutes % 60;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/hub/courses/${courseId}`)}
            className="mb-4"
          >
            ← {t('backToCourse')}
          </Button>
          <h1 className="text-3xl font-bold mb-2">{courseData.titleEn}</h1>
          <p className="text-muted-foreground">{t('progressOverview')}</p>
        </div>

        {/* Overall Progress Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('overallProgress')}</h2>
            <Badge variant="outline" className="text-lg">
              {progressData.progressPercentage.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={progressData.progressPercentage} className="h-3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                {progressData.completedLessons} / {progressData.totalLessons}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <BookOpen className="h-4 w-4" />
                {t('lessons')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                {completedQuizzes} / {totalQuizzes}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <FileText className="h-4 w-4" />
                {t('quizzes')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                {timeSpentHours}h {timeSpentMinutes}m
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                {t('timeSpent')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                {certificate ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                ) : progressData.progressPercentage === 100 ? (
                  <Award className="h-8 w-8 text-yellow-600 mx-auto" />
                ) : (
                  '—'
                )}
              </div>
              <div className="text-sm text-muted-foreground">{t('certificate')}</div>
            </div>
          </div>
        </Card>

        {/* Certificate Status */}
        {progressData.progressPercentage === 100 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-3">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t('courseCompleted')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {certificate
                      ? t('certificateReady')
                      : t('certificateGenerating')}
                  </p>
                </div>
              </div>
              {certificate ? (
                <Button
                  onClick={() => router.push(`/hub/courses/${courseId}/certificate`)}
                >
                  <Award className="h-4 w-4 mr-2" />
                  {t('viewCertificate')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    apiClient
                      .post(`/lms/certificates/generate/${courseId}`)
                      .then(() => {
                        router.push(`/hub/courses/${courseId}/certificate`);
                      });
                  }}
                >
                  {t('generateCertificate')}
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Section Breakdown */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">{t('sectionBreakdown')}</h2>
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
              <Card key={section.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{section.titleEn}</h3>
                    <p className="text-sm text-muted-foreground">
                      {completedSectionLessons} / {sectionLessons.length} {t('lessons')}
                      {sectionQuizzes.length > 0 && (
                        <> • {sectionQuizzes.length} {t('quizzes')}</>
                      )}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {sectionProgress.toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={sectionProgress} className="h-2" />
              </Card>
            );
          })}
        </div>

        {/* Learning Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('learningStats')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('lastAccessed')}</div>
                <div className="font-semibold">
                  {progressData.lastAccessedAt
                    ? format(new Date(progressData.lastAccessedAt), 'PPp')
                    : t('never')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('averageScore')}</div>
                <div className="font-semibold">
                  {detailedProgress?.averageQuizScore
                    ? `${detailedProgress.averageQuizScore.toFixed(1)}%`
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
