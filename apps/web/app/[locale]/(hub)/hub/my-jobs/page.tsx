'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Search, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  DollarSign,
  MapPin,
  Clock,
} from 'lucide-react';
import { CreateJobModal } from '@/components/modals';
import { format } from 'date-fns';
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
import { toast } from 'sonner';
import { useLookupsByType } from '@/lib/hooks/use-lookups';
import { LookupTypeCode } from '@leap-lms/shared-types';
import { useMyJobs, useDeleteJob } from '@/lib/hooks/use-api';

export default function MyJobsPage() {
  const t = useTranslations('jobs.myJobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState<number | null>(null);

  // Fetch lookups for job types and statuses
  const { data: jobTypes } = useLookupsByType(LookupTypeCode.JOB_TYPE);
  const { data: jobStatuses } = useLookupsByType(LookupTypeCode.JOB_STATUS);

  // Fetch user's jobs
  const { data: jobsData, isLoading: isLoadingJobs } = useMyJobs({
    search: searchQuery,
  });

  // Helper function to get lookup code by ID
  const getLookupCodeById = (lookupId: number | null | undefined, lookups: any[] | undefined): string => {
    if (!lookupId || !lookups) return '';
    const lookup = lookups.find((l) => l.id === lookupId);
    return lookup?.code || '';
  };

  // Helper function to get company name
  const getCompanyName = (job: any): string => {
    // Check if company data is included in the response
    if (job.company?.name) {
      return job.company.name;
    }
    // If companyId exists but no company data, show placeholder
    if (job.companyId) {
      return 'Company';
    }
    return 'Unknown';
  };
  
  const jobs = (jobsData?.data || []).map((job: any) => ({
    id: job.id,
    title: job.titleEn || '',
    company: getCompanyName(job),
    location: job.location || '',
    type: getLookupCodeById(job.jobTypeId, jobTypes) || 'full_time',
    status: getLookupCodeById(job.statusId, jobStatuses) || 'published',
    salary: job.salaryRange || '',
    applicationCount: job.applicationCount || 0,
    viewCount: job.viewCount || 0,
    postedAt: job.createdAt ? new Date(job.createdAt) : new Date(),
  }));

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && (job.status === 'active' || job.status === 'published')) ||
      (filter === 'closed' && (job.status === 'closed' || job.status === 'filled'));
    return matchesSearch && matchesFilter;
  });

  const activeJobs = jobs.filter((j: any) => j.status === 'active' || j.status === 'published');
  const totalApplications = jobs.reduce((sum: number, j: any) => sum + j.applicationCount, 0);
  const totalViews = jobs.reduce((sum: number, j: any) => sum + j.viewCount, 0);

  const deleteJobMutation = useDeleteJob();

  const handleDelete = async (jobId: number) => {
    try {
      await deleteJobMutation.mutateAsync(jobId);
      toast.success(t('deleteSuccess'));
      setDeleteJobId(null);
    } catch (error) {
      toast.error(t('deleteError'));
    }
  };

  // Helper function to get lookup label by code
  const getLookupLabel = (code: string, lookups: any[] | undefined): string => {
    if (!lookups) return code;
    const lookup = lookups.find((l) => l.code === code);
    return lookup?.nameEn || code;
  };

  // Helper function to get status color based on lookup code
  const getStatusColor = (statusCode: string) => {
    const status = jobStatuses?.find((s) => s.code === statusCode);
    // Use metadata or default colors based on status code
    if (statusCode === 'published' || statusCode === 'active') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (statusCode === 'closed' || statusCode === 'filled') {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-start">{t('title')}</h1>
          <p className="text-muted-foreground mt-2 text-start">
            {t('description')}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="me-2 h-4 w-4" />
          {t('postJob')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('totalJobs')}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{jobs.length}</div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              {activeJobs.length} {t('active')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('applications')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{totalApplications}</div>
            <p className="text-xs text-green-600 text-start mt-1">
              {t('thisWeek')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('totalViews')}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{totalViews}</div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              {t('avgPerJob', { count: jobs.length > 0 ? Math.round(totalViews / jobs.length) : 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">{t('avgApplications')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">
              {jobs.length > 0 ? Math.round(totalApplications / jobs.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              {t('perJob')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10 text-start"
          />
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">{t('all')}</TabsTrigger>
            <TabsTrigger value="active">{t('activeTab')}</TabsTrigger>
            <TabsTrigger value="closed">{t('closedTab')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {isLoadingJobs ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading jobs...</p>
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noJobsFound')}</p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="me-2 h-4 w-4" />
                {t('postFirstJob')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job: any) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(job.status)}>
                        {getLookupLabel(job.status, jobStatuses)}
                      </Badge>
                      <Badge variant="outline">
                        {getLookupLabel(job.type, jobTypes)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {t('posted', { date: format(job.postedAt, 'MMM d, yyyy') })}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-start">{job.title}</h3>
                    <p className="text-sm text-muted-foreground text-start">{job.company}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{getLookupLabel(job.type, jobTypes)}</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="me-2 h-4 w-4" />
                        {t('viewApplications')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="me-2 h-4 w-4" />
                        {t('editJob')}
                      </DropdownMenuItem>
                      {job.status === 'active' ? (
                        <DropdownMenuItem>
                          <Clock className="me-2 h-4 w-4" />
                          {t('closeJob')}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem>
                          <Clock className="me-2 h-4 w-4" />
                          {t('reopenJob')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteJobId(job.id)}
                      >
                        <Trash2 className="me-2 h-4 w-4" />
                        {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{job.applicationCount}</span>
                    <span className="text-muted-foreground">{t('applicationsLabel')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{job.viewCount}</span>
                    <span className="text-muted-foreground">{t('viewsLabel')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <CreateJobModal open={showCreateModal} onOpenChange={setShowCreateModal} />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteJobId !== null} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">{t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              {t('deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJobId && handleDelete(deleteJobId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
