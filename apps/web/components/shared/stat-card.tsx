'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  description?: string;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  iconColor = 'bg-primary/10 text-primary',
  className,
}: StatCardProps) {
  const TrendIcon = trend?.isPositive !== false ? TrendingUp : TrendingDown;
  const trendColor = trend?.isPositive !== false ? 'text-success' : 'text-destructive';

  return (
    <Card className={cn('card-elevated', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-start">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-start">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <TrendIcon className={`h-3 w-3 ${trendColor}`} />
            <span className={`text-xs ${trendColor} font-medium`}>
              {trend.isPositive !== false ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">from last week</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground text-start mt-3">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}