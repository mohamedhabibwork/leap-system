'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import type { ChartDataPoint } from '@leap-lms/shared-types';

interface RevenueChartProps {
  data: ChartDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Trend
          </CardTitle>
          <CardDescription>Monthly revenue over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No revenue data available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const totalRevenue = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue Trend
        </CardTitle>
        <CardDescription>
          Total: ${totalRevenue.toFixed(2)} over the last {data.length} months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple Bar Chart */}
          <div className="space-y-3">
            {data.map((point, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{point.month}</span>
                  <span className="text-muted-foreground">${point.value.toFixed(2)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(point.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="text-2xl font-bold text-green-600">
                ${(totalRevenue / data.length).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peak Month</p>
              <p className="text-2xl font-bold text-green-600">
                ${maxValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
