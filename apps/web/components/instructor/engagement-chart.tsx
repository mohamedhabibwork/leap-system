'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface EngagementChartProps {
  active: number;
  inactive: number;
}

export function EngagementChart({ active, inactive }: EngagementChartProps) {
  const total = active + inactive;
  const activePercent = total > 0 ? (active / total) * 100 : 0;
  const inactivePercent = total > 0 ? (inactive / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Student Engagement
        </CardTitle>
        <CardDescription>Active vs. Inactive students (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No student data available yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Donut Chart Representation */}
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="24"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="24"
                    strokeDasharray={`${(activePercent / 100) * 502.4} 502.4`}
                    strokeLinecap="round"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="24"
                    strokeDasharray={`${(inactivePercent / 100) * 502.4} 502.4`}
                    strokeDashoffset={`-${(activePercent / 100) * 502.4}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{total}</span>
                  <span className="text-sm text-muted-foreground">Total</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Active</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{active}</p>
                <p className="text-xs text-green-600">{activePercent.toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-lg border bg-red-50 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Inactive</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{inactive}</p>
                <p className="text-xs text-red-600">{inactivePercent.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
