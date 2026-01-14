'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillsBadgeProps {
  skill: string;
  variant?: 'default' | 'secondary' | 'outline';
  showCheckmark?: boolean;
  className?: string;
}

export function SkillsBadge({
  skill,
  variant = 'secondary',
  showCheckmark = true,
  className,
}: SkillsBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        'px-3 py-1.5 text-sm font-medium gap-1.5',
        className
      )}
    >
      {showCheckmark && (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
      )}
      {skill}
    </Badge>
  );
}

interface SkillsListProps {
  skills: string[];
  maxVisible?: number;
  className?: string;
}

export function SkillsList({ skills, maxVisible, className }: SkillsListProps) {
  const visibleSkills = maxVisible ? skills.slice(0, maxVisible) : skills;
  const remainingCount = maxVisible ? skills.length - maxVisible : 0;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {visibleSkills.map((skill, index) => (
        <SkillsBadge key={index} skill={skill} />
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}
