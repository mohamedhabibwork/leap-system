'use client';

import { useState, useMemo } from 'react';
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
import { Search, Briefcase, Plus, X, Filter, MapPin } from 'lucide-react';
import { AdContainer } from '@/components/ads';
import { CreateJobModal } from '@/components/modals/create-job-modal';
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { LookupTypeCode } from '@leap-lms/shared-types';

/**
 * Jobs Listing Page
 * 
 * RTL/LTR Support:
 * - Filters and job cards flow correctly
 * - Search and buttons positioned properly
 * - Text alignment respects reading direction
 * 
 * Theme Support:
 * - All components theme-aware
 * - Cards visible in both themes
 * - Proper contrast in dark/light modes
 */
export default function JobsPage() {
  const t = useTranslations('jobs.list');
  const [searchQuery, setSearchQuery] = useState('');
  const [type, setType] = useState('all');
  const [level, setLevel] = useState('all');
  const [location, setLocation] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch lookups for job types and levels
  const { data: jobTypes } = useLookupsByType(LookupTypeCode.JOB_TYPE);
  const { data: jobLevels } = useLookupsByType(LookupTypeCode.JOB_LEVEL);

  // Fetch jobs with filters
  const { data: jobsData, isLoading } = useJobs({
    search: searchQuery || undefined,
    type: type !== 'all' ? type : undefined,
    level: level !== 'all' ? level : undefined,
    location: location !== 'all' ? location : undefined,
  });

  const jobs = (jobsData ) || [];

  // Filter jobs client-side for additional filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter((job: any) => {
      const matchesSearch = !searchQuery || 
        (job.titleEn || job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.company?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [jobs, searchQuery]);

  // Active filters count
  const activeFiltersCount = [
    type !== 'all', 
    level !== 'all', 
    location !== 'all', 
    searchQuery
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setType('all');
    setLevel('all');
    setLocation('all');
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-start">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-start">
            {t('description')}
          </p>
        </div>
        <Button 
          className="gap-2 shrink-0" 
          onClick={() => setShowCreateModal(true)}
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('postJob')}</span>
          <span className="sm:hidden">{t('postJob')}</span>
        </Button>
      </div>

      {/* Banner Ad */}
      <AdContainer
        placement="jobs_listing_banner"
        type="banner"
        width={728}
        height={90}
        className="mx-auto hidden md:block"
      />

      {/* Filters Card */}
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10 bg-background border-input"
                />
              </div>

              <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-background border-input">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t('type.label')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all" className="cursor-pointer">
                      {t('type.all')}
                    </SelectItem>
                    <SelectItem value="full-time" className="cursor-pointer">
                      {t('type.fullTime')}
                    </SelectItem>
                    <SelectItem value="part-time" className="cursor-pointer">
                      {t('type.partTime')}
                    </SelectItem>
                    <SelectItem value="contract" className="cursor-pointer">
                      {t('type.contract')}
                    </SelectItem>
                    <SelectItem value="freelance" className="cursor-pointer">
                      {t('type.freelance')}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-background border-input">
                    <SelectValue placeholder={t('level.label')} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all" className="cursor-pointer">
                      {t('level.all')}
                    </SelectItem>
                    <SelectItem value="entry" className="cursor-pointer">
                      {t('level.entry')}
                    </SelectItem>
                    <SelectItem value="mid" className="cursor-pointer">
                      {t('level.mid')}
                    </SelectItem>
                    <SelectItem value="senior" className="cursor-pointer">
                      {t('level.senior')}
                    </SelectItem>
                    <SelectItem value="lead" className="cursor-pointer">
                      {t('level.lead')}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-background border-input">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={t('location.label')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all" className="cursor-pointer">
                      {t('location.all')}
                    </SelectItem>
                    <SelectItem value="remote" className="cursor-pointer">
                      {t('location.remote')}
                    </SelectItem>
                    <SelectItem value="hybrid" className="cursor-pointer">
                      {t('location.hybrid')}
                    </SelectItem>
                    <SelectItem value="on-site" className="cursor-pointer">
                      {t('location.onSite')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {activeFiltersCount} {t('activeFilters', { count: activeFiltersCount })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 gap-1 text-xs"
                >
                  <X className="h-3 w-3" />
                  {t('clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {!isLoading && filteredJobs.length > 0 && (
        <div className="text-sm text-muted-foreground text-start">
          {t('showingResults', { count: filteredJobs.length })}
        </div>
      )}

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton variant="list" count={5} />
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job: any, index: number) => (
            <div key={job.id || index}>
              <JobCard job={job} variant="list" />
              {/* Insert ad after every 5 jobs */}
              {(index + 1) % 5 === 0 && (
                <AdContainer
                  key={`ad-${job.id}-${index}`}
                  placement="jobs_between_content"
                  type="sponsored"
                  className="mt-4"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <NoJobs />
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <CreateJobModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
