'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface StatComparisonCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  iconColor: string;
}

export function StatComparisonCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  iconColor,
}: StatComparisonCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) {
      return <Minus className="h-4 w-4" />;
    }
    return change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) {
      return 'text-gray-600';
    }
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTrendBg = () => {
    if (change === undefined || change === 0) {
      return 'bg-gray-100';
    }
    return change > 0 ? 'bg-green-100' : 'bg-red-100';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className={`p-3 rounded-full ${iconColor}`}>
          {icon}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold">{value}</p>
        
        {change !== undefined && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendBg()} ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {Math.abs(change).toFixed(1)}% {changeLabel}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
