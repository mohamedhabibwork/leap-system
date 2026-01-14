'use client';

import { useState } from 'react';
import { useJobs } from '@/lib/hooks/use-api';
import { JobCard } from '@/components/cards/job-card';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { NoJobs } from '@/components/empty/no-jobs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
          <h1 className="text-display text-start">Job Board</h1>
          <p className="text-muted-foreground mt-2 text-start">
            Discover your next career opportunity
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          Post a Job
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
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Briefcase className="h-4 w-4 me-2" />
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-Time</SelectItem>
                <SelectItem value="part-time">Part-Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>

            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="on-site">On-site</SelectItem>
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
