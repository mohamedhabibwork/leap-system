'use client';

import { use } from 'react';
import { useCourse } from '@/lib/hooks/use-api';
import { useCourseResources } from '@/lib/hooks/use-resources-api';
import { PageLoader } from '@/components/loading/page-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Video, 
  Music, 
  Link as LinkIcon, 
  Archive,
  Download,
  File,
  Filter
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { useState } from 'react';

const resourceTypeIcons = {
  pdf: FileText,
  video: Video,
  audio: Music,
  document: FileText,
  link: LinkIcon,
  archive: Archive,
};

const resourceTypeLabels = {
  pdf: 'PDF',
  video: 'Video',
  audio: 'Audio',
  document: 'Document',
  link: 'Link',
  archive: 'Archive',
};

export default function CourseResourcesPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const t = useTranslations('courses.resources');
  const { id } = use(params);
  const courseId = parseInt(id);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  // Fetch course with optimized caching (already cached from main page)
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  
  // Fetch resources with optimized caching
  const { data: resources, isLoading: resourcesLoading } = useCourseResources(courseId);

  const handleDownload = async (resourceId: number, fileName: string, fileUrl: string) => {
    try {
      // Track download
      await apiClient.post(`/lms/resources/${resourceId}/track-download`);
      
      // Download file
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (courseLoading || resourcesLoading) {
    return <PageLoader message={t('loading', { defaultValue: 'Loading resources...' })} />;
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <p className="text-muted-foreground">{t('notFound', { defaultValue: 'Course not found' })}</p>
      </div>
    );
  }

  const filteredResources = selectedType
    ? resources?.filter(r => r.resourceTypeId?.toString() === selectedType) || []
    : resources || [];

  const resourceTypes = Array.from(
    new Set(resources?.map(r => r.resourceTypeId?.toString()).filter(Boolean))
  );

  const courseData = course as any;
  const sections = courseData.sections || [];
  
  // Group resources by section
  const resourcesBySection = sections.map((section: { id: number; titleEn?: string }) => ({
    section,
    resources: filteredResources.filter((r: { sectionId?: number }) => r.sectionId === section.id),
  }));

  // Resources without section
  const resourcesWithoutSection = filteredResources.filter((r: { sectionId?: number }) => !r.sectionId);

  return (
    <div className="min-h-screen bg-white dark:bg-background py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-4 sm:space-y-6">
        {/* Header - Responsive Design */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{courseData.titleEn || course.title}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              {t('resources', { defaultValue: 'Course Resources' })}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            ← {t('backToCourse', { defaultValue: 'Back to Course' })}
          </Button>
        </div>

        {/* Filters - Responsive */}
        {resourceTypes.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedType === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(null)}
              className="text-xs sm:text-sm"
            >
              {t('all', { defaultValue: 'All' })}
            </Button>
            {resourceTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="text-xs sm:text-sm"
              >
                {t(`type.${type}`, { defaultValue: type })}
              </Button>
            ))}
          </div>
        )}

      {/* Resources List - Organized by Section - Responsive */}
      <div className="space-y-4 sm:space-y-6">
        {filteredResources.length === 0 ? (
          <Card className="border border-gray-200 dark:border-border">
            <CardContent className="py-8 sm:py-12 text-center">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('noResources', { defaultValue: 'No resources available for this course.' })}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {resourcesBySection.map(({ section, resources: sectionResources }) => {
              if (sectionResources.length === 0) return null;
              
              return (
                <div key={section.id} className="space-y-3 sm:space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">{section.titleEn}</h2>
                  <div className="grid gap-3 sm:gap-4">
                    {sectionResources.map((resource: any) => {
                      const Icon = FileText;
                      return (
                        <Card key={resource.id} className="hover:shadow-md transition-shadow border border-gray-200 dark:border-border">
                          <CardHeader className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="rounded-lg bg-primary/10 p-2 sm:p-3 shrink-0">
                                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base sm:text-lg mb-1 sm:mb-2 text-foreground truncate">
                                    {resource.titleEn || resource.titleAr || 'Untitled Resource'}
                                  </CardTitle>
                                  {resource.descriptionEn && (
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                                      {resource.descriptionEn}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                    {resource.fileSize && (
                                      <span>
                                        {(resource.fileSize / 1024 / 1024).toFixed(2)} MB
                                      </span>
                                    )}
                                    {resource.downloadCount !== undefined && (
                                      <span>
                                        {resource.downloadCount} {t('downloads', { defaultValue: 'downloads' })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => {
                                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                                  window.open(`${API_URL}/api/v1/lms/resources/${resource.id}/download`, '_blank');
                                }}
                                disabled={!resource.fileUrl}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                {t('download', { defaultValue: 'Download' })}
                              </Button>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {resourcesWithoutSection.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  {t('generalResources', { defaultValue: 'General Resources' })}
                </h2>
                <div className="grid gap-4">
                  {resourcesWithoutSection.map((resource: any) => {
                    const Icon = FileText;
                    return (
                      <Card key={resource.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="rounded-lg bg-primary/10 p-3">
                                <Icon className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-2">
                                  {resource.titleEn || resource.titleAr || 'Untitled Resource'}
                                </CardTitle>
                                {resource.descriptionEn && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {resource.descriptionEn}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  {resource.fileSize && (
                                    <span>
                                      {(resource.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                  )}
                                  {resource.downloadCount !== undefined && (
                                    <span>
                                      {resource.downloadCount} {t('downloads', { defaultValue: 'downloads' })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                                window.open(`${API_URL}/api/v1/lms/resources/${resource.id}/download`, '_blank');
                              }}
                              disabled={!resource.fileUrl}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t('download', { defaultValue: 'Download' })}
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
