'use client';

import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbNavProps {
  customLabels?: Record<string, string>;
  excludePaths?: string[];
}

export function BreadcrumbNav({ customLabels = {}, excludePaths = [] }: BreadcrumbNavProps) {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  
  // Remove locale from path
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?\//, '/');
  
  // Split path and filter empty strings
  const segments = pathWithoutLocale.split('/').filter(Boolean);
  
  // Don't show breadcrumbs on home or single-level pages
  if (segments.length <= 1 || excludePaths.includes(pathWithoutLocale)) {
    return null;
  }

  // Generate breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    const isLast = index === segments.length - 1;
    
    // Format label
    let label = customLabels[segment] || segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Special cases
    if (segment === 'hub') label = t('breadcrumb.home');
    if (!isNaN(Number(segment))) label = `#${segment}`;
    
    return {
      path,
      label,
      isLast,
    };
  });

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/hub">
            <Home className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbs.map((breadcrumb, index) => (
          <Fragment key={breadcrumb.path}>
            <BreadcrumbSeparator>
              <ChevronRight className={cn("h-4 w-4 rtl-flip")} />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <BreadcrumbPage className="text-start">{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={breadcrumb.path} className="text-start">
                  {breadcrumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}