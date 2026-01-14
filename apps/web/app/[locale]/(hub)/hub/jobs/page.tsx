'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useJobs } from '@/lib/hooks/use-api';
import { JobCard } from '@/components/cards/job-card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { NoJobs } from '@/components/empty/no-jobs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Briefcase, Plus } from 'lucide-react';
import { AdContainer } from '@/components/ads';
import { CreateJobModal } from '@/components/modals/create-job-modal';

/**
 * Jobs Listing Page
 * 
 * RTL/LTR Support:
 * - Filters and job cards flow correctly
 * - Search and buttons positioned properly
 * 
 * Theme Support:
 * - All components theme-aware
 * - Cards visible in both themes
 */
export default function JobsPage() {
  const t = useTranslations('jobs.list');
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState('all');
  const [level, setLevel] = useState('all');
  const [location, setLocation] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Note: companyId should come from user's company or selected company
  const [selectedCompanyId] = useState(1); // Placeholder

  const { data: jobs, isLoading } = useJobs({
    search: searchQuery,
    jobType: type !== 'all' ? type : undefined,
    experienceLevel: level !== 'all' ? level : undefined,
    locationType: location !== 'all' ? location : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-start">{t('title')}</h1>
          <p className="text-muted-foreground mt-2 text-start">
            {t('description')}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          {t('postJob')}
        </Button>
      </div>

      {/* Banner Ad */}
      <AdContainer
        placement="jobs_listing_banner"
        type="banner"
        width={728}
        height={90}
        className="mx-auto"
      />

      {/* Filters Card */}
      <Card className="card-feature">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10"
              />
            </div>

            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Briefcase className="h-4 w-4 me-2" />
                <SelectValue placeholder={t('type.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('type.all')}</SelectItem>
                <SelectItem value="full-time">{t('type.fullTime')}</SelectItem>
                <SelectItem value="part-time">{t('type.partTime')}</SelectItem>
                <SelectItem value="contract">{t('type.contract')}</SelectItem>
                <SelectItem value="freelance">{t('type.freelance')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={t('level.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('level.all')}</SelectItem>
                <SelectItem value="entry">{t('level.entry')}</SelectItem>
                <SelectItem value="mid">{t('level.mid')}</SelectItem>
                <SelectItem value="senior">{t('level.senior')}</SelectItem>
                <SelectItem value="lead">{t('level.lead')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={t('location.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('location.all')}</SelectItem>
                <SelectItem value="remote">{t('location.remote')}</SelectItem>
                <SelectItem value="hybrid">{t('location.hybrid')}</SelectItem>
                <SelectItem value="on-site">{t('location.onSite')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton variant="list" count={5} />
        </div>
      ) : jobs && (jobs as any).length > 0 ? (
        <div className="space-y-4">
          {(jobs as any).map((job: any, index: number) => (
            <>
              <JobCard key={job.id} job={job} variant="list" />
              {/* Insert sponsored job ad after every 5 jobs */}
              {(index + 1) % 5 === 0 && (
                <AdContainer
                  key={`ad-${index}`}
                  placement="jobs_between_content"
                  type="sponsored"
                />
              )}
            </>
          ))}
        </div>
      ) : (
        <NoJobs />
      )}

      {/* Create Job Modal */}
      <CreateJobModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        companyId={selectedCompanyId}
      />
    </div>
  );
}
