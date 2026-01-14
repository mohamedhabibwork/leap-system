'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileImage, FileVideo, File } from 'lucide-react';
import { useTrackResourceDownload } from '@/lib/hooks/use-resources-api';
import { CourseResource } from '@leap-lms/shared-types';
import { useState } from 'react';

interface ResourceCardProps {
  resource: CourseResource;
  locale?: string;
}

export function ResourceCard({ resource, locale = 'en' }: ResourceCardProps) {
  const trackDownload = useTrackResourceDownload();
  const [isDownloading, setIsDownloading] = useState(false);

  const title = locale === 'ar' && resource.titleAr ? resource.titleAr : resource.titleEn;
  const description = locale === 'ar' && resource.descriptionAr ? resource.descriptionAr : resource.descriptionEn;

  const getFileIcon = () => {
    const fileName = resource.fileName?.toLowerCase() || '';
    if (fileName.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      return <FileImage className="w-5 h-5 text-blue-600" />;
    }
    if (fileName.match(/\.(mp4|avi|mov|wmv|flv|webm)$/)) {
      return <FileVideo className="w-5 h-5 text-purple-600" />;
    }
    if (fileName.match(/\.(pdf|doc|docx|txt)$/)) {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const result = await trackDownload.mutateAsync(resource.id);
      
      // Open file in new tab or trigger download
      window.open(result.fileUrl, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{getFileIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {resource.fileName && (
              <span className="truncate max-w-[200px]">{resource.fileName}</span>
            )}
            {resource.fileSize && (
              <>
                <span>•</span>
                <span>{formatFileSize(resource.fileSize)}</span>
              </>
            )}
            {resource.downloadCount > 0 && (
              <>
                <span>•</span>
                <span>{resource.downloadCount} downloads</span>
              </>
            )}
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-shrink-0"
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </div>
    </Card>
  );
}
