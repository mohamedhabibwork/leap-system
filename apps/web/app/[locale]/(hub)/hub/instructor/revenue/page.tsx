'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  useInstructorEarnings,
  useInstructorPayouts,
  useRequestPayout,
} from '@/lib/hooks/use-instructor-api';
import { useAnalyticsStore, selectDateRange } from '@/stores/analytics.store';
import { PageLoader } from '@/components/loading/page-loader';
import { toast } from 'sonner';

export default function InstructorRevenuePage() {
  const dateRange = useAnalyticsStore(selectDateRange);
  const { setDateRangePreset } = useAnalyticsStore();

  const { data: earningsResponse, isLoading: earningsLoading } = useInstructorEarnings({
    start: dateRange.start,
    end: dateRange.end,
  });

  const { data: payoutsResponse, isLoading: payoutsLoading } = useInstructorPayouts();
  const requestPayout = useRequestPayout();

  const handleRequestPayout = () => {
    const availableAmount = earningsResponse?.data?.availableBalance || 0;
    if (availableAmount < 50) {
      toast.error('Minimum payout amount is $50');
      return;
    }

    requestPayout.mutate(availableAmount, {
      onSuccess: () => {
        toast.success('Payout request submitted successfully');
      },
      onError: () => {
        toast.error('Failed to request payout');
      },
    });
  };

  if (earningsLoading || payoutsLoading) {
    return <PageLoader message="Loading revenue data..." />;
  }

  const earnings = earningsResponse?.data || {};
  const payouts = payoutsResponse?.data || [];
  const revenueChart = earnings.chartData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue & Earnings</h1>
          <p className="text-muted-foreground mt-2">
            Track your earnings and manage payouts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={dateRange.preset === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRangePreset('week')}
          >
            7 Days
          </Button>
          <Button
            variant={dateRange.preset === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRangePreset('month')}
          >
            30 Days
          </Button>
          <Button
            variant={dateRange.preset === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRangePreset('year')}
          >
            This Year
          </Button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${earnings.totalEarnings?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {earnings.earningsChange >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+{earnings.earningsChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{earnings.earningsChange}%</span>
                </>
              )}
              <span className="ml-1">from last period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${earnings.availableBalance?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${earnings.pendingBalance?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Processing payouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${earnings.monthlyEarnings?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              From {earnings.enrollmentCount || 0} enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Request Payout */}
      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>
            Minimum payout amount is $50. Payouts are processed within 5-7 business days.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">
              ${earnings.availableBalance?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-muted-foreground">Available for payout</p>
          </div>
          <Button
            onClick={handleRequestPayout}
            disabled={
              requestPayout.isPending ||
              (earnings.availableBalance || 0) < 50
            }
          >
            <Download className="mr-2 h-4 w-4" />
            {requestPayout.isPending ? 'Processing...' : 'Request Payout'}
          </Button>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Your earnings over time</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>No revenue data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="payouts">
        <TabsList>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="courses">Course Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>All your completed and pending payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No payout history available
                      </TableCell>
                    </TableRow>
                  ) : (
                    payouts.map((payout: any) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${payout.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payout.status === 'completed'
                                ? 'default'
                                : payout.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {payout.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payout.method || 'Bank Transfer'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Detailed breakdown of all earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.transactions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    earnings.transactions?.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.courseName}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          +${transaction.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Course</CardTitle>
              <CardDescription>Earnings breakdown per course</CardDescription>
            </CardHeader>
            <CardContent>
              {earnings.courseBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={earnings.courseBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="courseName" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                    <Bar dataKey="enrollments" fill="#8884d8" name="Enrollments" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <p>No course revenue data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
