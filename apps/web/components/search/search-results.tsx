'use client';

import { SearchResult } from '@/lib/api/search';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
  User,
  FileText,
  Users,
  Building2,
  Calendar,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
}

/**
 * SearchResults Component
 * Displays search results in a unified card format
 * 
 * RTL/LTR Support:
 * - All text aligned with text-start
 * - Icons positioned with logical spacing
 * - Card content flows correctly in both directions
 * 
 * Theme Support:
 * - Cards use theme-aware backgrounds
 * - Text colors adapt to theme
 * - Hover states visible in both themes
 */
export function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No results found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
      ))}
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const getIcon = () => {
    switch (result.type) {
      case 'user':
        return <User className="h-5 w-5" />;
      case 'post':
        return <FileText className="h-5 w-5" />;
      case 'group':
        return <Users className="h-5 w-5" />;
      case 'page':
        return <Building2 className="h-5 w-5" />;
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'job':
        return <Briefcase className="h-5 w-5" />;
      case 'course':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getLink = () => {
    switch (result.type) {
      case 'user':
        return `/hub/users/${result.id}`;
      case 'post':
        return `/hub/social/post/${result.id}`;
      case 'group':
        return `/hub/social/groups/${result.id}`;
      case 'page':
        return `/hub/social/pages/${result.id}`;
      case 'event':
        return `/hub/events/${result.id}`;
      case 'job':
        return `/hub/jobs/${result.id}`;
      case 'course':
        return `/hub/courses/${result.id}`;
      default:
        return '#';
    }
  };

  return (
    <Link href={getLink()}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image/Avatar */}
            <div className="shrink-0">
              {result.type === 'user' ? (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={result.image} />
                  <AvatarFallback className="bg-primary/10">
                    {result.title[0]}
                  </AvatarFallback>
                </Avatar>
              ) : result.image ? (
                <Image
                  src={result.image}
                  alt={result.title}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  {getIcon()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-lg line-clamp-1 text-start">
                  {result.title}
                </h3>
                <Badge variant="secondary" className="shrink-0 capitalize">
                  {result.type}
                </Badge>
              </div>

              {result.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 text-start">
                  {result.description}
                </p>
              )}

              {/* Metadata */}
              {result.metadata && (
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                  {result.metadata.location && (
                    <span className="flex items-center gap-1">
                      <span>📍</span>
                      {result.metadata.location}
                    </span>
                  )}
                  {result.metadata.date && (
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      {result.metadata.date}
                    </span>
                  )}
                  {result.metadata.memberCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {result.metadata.memberCount} members
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
