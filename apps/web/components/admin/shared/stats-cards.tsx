'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color?: string;
}

interface StatsCardsProps {
  stats: StatCard[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>{' '}
                  from last month
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
