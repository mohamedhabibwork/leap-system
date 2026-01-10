'use client';

import { useState } from 'react';
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

export default function MyJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState<number | null>(null);

  // Mock data - replace with real API calls
  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'Remote',
      type: 'full-time',
      status: 'active',
      salary: '$120k - $150k',
      applicationCount: 45,
      viewCount: 234,
      postedAt: new Date('2024-01-10'),
    },
    {
      id: 2,
      title: 'React Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      type: 'contract',
      status: 'active',
      salary: '$80k - $100k',
      applicationCount: 23,
      viewCount: 156,
      postedAt: new Date('2024-01-08'),
    },
    {
      id: 3,
      title: 'Full Stack Engineer',
      company: 'Enterprise Inc',
      location: 'San Francisco, CA',
      type: 'full-time',
      status: 'closed',
      salary: '$140k - $180k',
      applicationCount: 67,
      viewCount: 345,
      postedAt: new Date('2024-01-01'),
    },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && job.status === 'active') ||
      (filter === 'closed' && job.status === 'closed');
    return matchesSearch && matchesFilter;
  });

  const activeJobs = jobs.filter((j) => j.status === 'active');
  const totalApplications = jobs.reduce((sum, j) => sum + j.applicationCount, 0);
  const totalViews = jobs.reduce((sum, j) => sum + j.viewCount, 0);

  const handleDelete = async (jobId: number) => {
    try {
      // Call delete API
      toast.success('Job deleted successfully');
      setDeleteJobId(null);
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-start">My Jobs</h1>
          <p className="text-muted-foreground mt-2 text-start">
            Manage your job postings and track applications
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="me-2 h-4 w-4" />
          Post Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{jobs.length}</div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              {activeJobs.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{totalApplications}</div>
            <p className="text-xs text-green-600 text-start mt-1">
              ↑ 15% this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{totalViews}</div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              Avg {jobs.length > 0 ? Math.round(totalViews / jobs.length) : 0} per job
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Avg. Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">
              {jobs.length > 0 ? Math.round(totalApplications / jobs.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              Per job posting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10 text-start"
          />
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No jobs found</p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="me-2 h-4 w-4" />
                Post Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <Badge variant="outline">{job.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Posted {format(job.postedAt, 'MMM d, yyyy')}
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
                        <span>{job.type}</span>
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
                        View Applications
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="me-2 h-4 w-4" />
                        Edit Job
                      </DropdownMenuItem>
                      {job.status === 'active' ? (
                        <DropdownMenuItem>
                          <Clock className="me-2 h-4 w-4" />
                          Close Job
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem>
                          <Clock className="me-2 h-4 w-4" />
                          Reopen Job
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteJobId(job.id)}
                      >
                        <Trash2 className="me-2 h-4 w-4" />
                        Delete
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
                    <span className="text-muted-foreground">applications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{job.viewCount}</span>
                    <span className="text-muted-foreground">views</span>
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
            <AlertDialogTitle className="text-start">Delete Job</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              Are you sure you want to delete this job posting? All applications will be lost and
              this action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJobId && handleDelete(deleteJobId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
