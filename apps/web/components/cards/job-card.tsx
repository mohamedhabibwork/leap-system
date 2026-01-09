'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Clock, DollarSign } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ApplyButton } from '@/components/buttons/apply-button';
import { SaveButton } from '@/components/buttons/save-button';
import { ShareButton } from '@/components/buttons/share-button';
import { format } from 'date-fns';

interface JobCardProps {
  job: {
    id: number;
    title: string;
    description?: string;
    company: { id: number; name: string; logo?: string };
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'freelance';
    experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
    salary?: { min: number; max: number; currency: string };
    postedAt: string;
    hasApplied?: boolean;
    isSaved?: boolean;
  };
  variant?: 'grid' | 'list';
  showActions?: boolean;
}

export function JobCard({ job, variant = 'grid', showActions = true }: JobCardProps) {
  const isGrid = variant === 'grid';

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-green-500';
      case 'part-time':
        return 'bg-blue-500';
      case 'contract':
        return 'bg-orange-500';
      case 'freelance':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isGrid ? '' : 'flex'}`}>
      <CardHeader className={isGrid ? '' : 'flex-row items-center gap-4'}>
        <Link href={`/hub/social/pages/${job.company.id}`} className="flex-shrink-0">
          {job.company.logo ? (
            <Image
              src={job.company.logo}
              alt={job.company.name}
              width={60}
              height={60}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/hub/jobs/${job.id}`} className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground">{job.company.name}</p>
            </Link>
            {showActions && (
              <SaveButton
                entityType="job"
                entityId={job.id}
                isSaved={job.isSaved}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className={getTypeColor(job.type)}>
              {job.type.replace('-', ' ')}
            </Badge>
            <Badge variant="outline">{job.experienceLevel}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {job.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {job.location}
          </div>
          {job.salary && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            Posted {format(new Date(job.postedAt), 'MMM d, yyyy')}
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="flex items-center justify-between gap-2">
          <ApplyButton jobId={job.id} hasApplied={job.hasApplied} />
          <ShareButton
            entityType="job"
            entityId={job.id}
            url={`/hub/jobs/${job.id}`}
            title={job.title}
          />
        </CardFooter>
      )}
    </Card>
  );
}
