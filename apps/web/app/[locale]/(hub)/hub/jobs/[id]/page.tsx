'use client';

import { useJob } from '@/lib/hooks/use-api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ApplyButton } from '@/components/buttons/apply-button';
import { ShareButton } from '@/components/buttons/share-button';
import { SaveButton } from '@/components/buttons/save-button';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Building2,
  Globe,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

/**
 * Job Detail Page
 * 
 * RTL/LTR Support:
 * - All text aligned with text-start
 * - Icons use logical spacing (me/ms)
 * - Lists and grids adapt to reading direction
 * - Flex items flow correctly in both directions
 * 
 * Theme Support:
 * - Uses theme-aware colors throughout
 * - Card backgrounds adapt to theme
 * - Borders and dividers use theme colors
 * - Icons and badges work in both themes
 */
export default function JobDetailPage() {
  const params = useParams();
  const jobId = Number(params.id);
  
  const { data: job, isLoading } = useJob(jobId);

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Job not found</h2>
          <p className="text-muted-foreground">The job posting you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-green-500';
      case 'part-time':
        return 'bg-blue-500';
      case 'contract':
        return 'bg-orange-500';
      case 'freelance':
        return 'bg-purple-500';
      case 'internship':
        return 'bg-pink-500';
      default:
        return 'bg-muted';
    }
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'remote':
        return 'bg-blue-500';
      case 'hybrid':
        return 'bg-purple-500';
      case 'on-site':
        return 'bg-green-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Company Logo */}
            <Link
              href={`/hub/social/pages/${job.company.id}`}
              className="shrink-0"
            >
              {job.company.logo ? (
                <Image
                  src={job.company.logo}
                  alt={job.company.name}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-[120px] h-[120px] bg-linear-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </Link>

            {/* Job Info */}
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-3xl font-bold tracking-tight text-start flex-1">
                    {job.title}
                  </h1>
                  <SaveButton
                    entityType="job"
                    entityId={job.id}
                    isSaved={job.isSaved}
                    size="default"
                  />
                </div>
                
                <Link
                  href={`/hub/social/pages/${job.company.id}`}
                  className="text-xl text-primary hover:underline text-start block"
                >
                  {job.company.name}
                </Link>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getJobTypeColor(job.jobType)}>
                  {job.jobType.replace('-', ' ')}
                </Badge>
                <Badge className={getLocationTypeColor(job.locationType)}>
                  <Globe className="w-3 h-3 me-1" />
                  {job.locationType}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {job.experienceLevel}
                </Badge>
                {job.isFeatured && (
                  <Badge className="bg-amber-500">Featured</Badge>
                )}
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                      <span className="ms-1">/ {job.salary.period}</span>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {format(new Date(job.postedAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{job.applicationCount} applicants</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <ApplyButton
                  jobId={job.id}
                  hasApplied={job.hasApplied}
                  size="lg"
                />
                <ShareButton
                  entityType="job"
                  entityId={job.id}
                  url={`/hub/jobs/${job.id}`}
                  title={job.title}
                  shareCount={0}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-start">Job Description</h2>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap text-start leading-relaxed">
                {job.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-start">Responsibilities</h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.responsibilities.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-start">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-start">Requirements</h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.requirements.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-start">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-start">Benefits</h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.benefits.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-start">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-start">Required Skills</h2>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Company Info Card */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-start">About Company</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href={`/hub/social/pages/${job.company.id}`}
                className="block"
              >
                {job.company.logo ? (
                  <Image
                    src={job.company.logo}
                    alt={job.company.name}
                    width={200}
                    height={100}
                    className="w-full h-24 object-contain rounded-lg bg-muted p-4"
                  />
                ) : (
                  <div className="w-full h-24 bg-linear-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </Link>

              <div className="text-start">
                <Link
                  href={`/hub/social/pages/${job.company.id}`}
                  className="text-lg font-semibold hover:text-primary"
                >
                  {job.company.name}
                </Link>
                {job.company.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block mt-1"
                  >
                    Visit Website
                  </a>
                )}
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 text-start">
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 text-start">
                    <p className="font-medium">Job Type</p>
                    <p className="text-muted-foreground capitalize">
                      {job.jobType.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 text-start">
                    <p className="font-medium">Experience Level</p>
                    <p className="text-muted-foreground capitalize">
                      {job.experienceLevel}
                    </p>
                  </div>
                </div>

                {job.category && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 text-start">
                      <p className="font-medium">Category</p>
                      <p className="text-muted-foreground">{job.category}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Stats Card */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-start">Job Stats</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Applications</span>
                <span className="font-semibold">{job.applicationCount}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Views</span>
                <span className="font-semibold">{job.viewCount}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Posted</span>
                <span className="font-semibold">
                  {format(new Date(job.postedAt), 'MMM d')}
                </span>
              </div>
              {job.expiresAt && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-semibold">
                      {format(new Date(job.expiresAt), 'MMM d')}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="container max-w-5xl py-6 space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="w-[120px] h-[120px] rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
