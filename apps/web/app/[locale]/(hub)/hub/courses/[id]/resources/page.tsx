'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
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
      <div className="container mx-auto py-8">
        <p>{t('notFound', { defaultValue: 'Course not found' })}</p>
      </div>
    );
  }

  const filteredResources = selectedType
    ? resources?.filter(r => r.resourceTypeId?.toString() === selectedType)
    : resources || [];

  const resourceTypes = Array.from(
    new Set(resources?.map(r => r.resourceTypeId?.toString()).filter(Boolean))
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-2">
            {t('resources', { defaultValue: 'Course Resources' })}
          </p>
        </div>
      </div>

      {/* Filters */}
      {resourceTypes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedType === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(null)}
          >
            {t('all', { defaultValue: 'All' })}
          </Button>
          {resourceTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
            >
              {t(`type.${type}`, { defaultValue: type })}
            </Button>
          ))}
        </div>
      )}

      {/* Resources List */}
      <div className="grid gap-4">
        {filteredResources.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t('noResources', { defaultValue: 'No resources available for this course.' })}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredResources.map((resource) => {
            const Icon = FileText; // Default icon
            const typeLabel = resource.resourceTypeId?.toString() || 'document';

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
                        if (resource.fileUrl && resource.fileName) {
                          handleDownload(resource.id, resource.fileName, resource.fileUrl);
                        }
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
          })
        )}
      </div>
    </div>
  );
}
