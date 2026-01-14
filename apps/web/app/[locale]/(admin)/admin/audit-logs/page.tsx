'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download, Filter, AlertCircle, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { PageLoader } from '@/components/loading/page-loader';
import { useDashboardUIStore, selectPageFilters, selectPagePagination } from '@/stores/dashboard-ui.store';
import { toast } from 'sonner';

const PAGE_KEY = 'admin-audit-logs';

const levelIcons = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  warning: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export default function AuditLogsPage() {
  const { updateFilter, updatePagination } = useDashboardUIStore();
  const filters = useDashboardUIStore(selectPageFilters(PAGE_KEY));
  const pagination = useDashboardUIStore(selectPagePagination(PAGE_KEY));
  const [isExporting, setIsExporting] = useState(false);

  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', filters, pagination],
    queryFn: () =>
      apiClient.get('/admin/audit-logs', {
        params: {
          search: filters.search,
          level: filters.level,
          action: filters.action,
          page: pagination.page,
          pageSize: pagination.pageSize,
        },
      }),
  });

  const { data: statsResponse } = useQuery({
    queryKey: ['admin', 'audit-logs', 'stats'],
    queryFn: () => apiClient.get('/admin/audit-logs/stats'),
  });

  const handleExport = () => {
    setIsExporting(true);
    toast.info('Preparing export...');
    
    apiClient
      .get('/admin/audit-logs/export', {
        params: {
          search: filters.search,
          level: filters.level,
          action: filters.action,
        },
        responseType: 'blob',
      })
      .then((blob: any) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Audit logs exported successfully');
      })
      .catch((error) => {
        console.error('Export failed:', error);
        toast.error('Failed to export audit logs');
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  if (isLoading) {
    return <PageLoader message="Loading audit logs..." />;
  }

  const logs = logsResponse?.data || [];
  const total = logsResponse?.total || 0;
  const stats = statsResponse?.data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-2">
            Track all system activities and administrative actions
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Logs
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warningCount || 0}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errorCount || 0}</div>
            <p className="text-xs text-muted-foreground">Critical issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successCount || 0}</div>
            <p className="text-xs text-muted-foreground">Successful operations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, or details..."
                value={filters.search || ''}
                onChange={(e) => updateFilter(PAGE_KEY, { search: e.target.value })}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.level || 'all'}
                onValueChange={(value) => updateFilter(PAGE_KEY, { level: value })}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.action || 'all'}
                onValueChange={(value) => updateFilter(PAGE_KEY, { action: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="USER">User Actions</SelectItem>
                  <SelectItem value="COURSE">Course Actions</SelectItem>
                  <SelectItem value="SETTINGS">Settings</SelectItem>
                  <SelectItem value="BACKUP">Backup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Level</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>{levelIcons[log.level as keyof typeof levelIcons]}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {log.resource}
                          {log.resourceId ? ` #${log.resourceId}` : ''}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{log.details}</TableCell>
                      <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {logs.length} of {total} logs
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => updatePagination(PAGE_KEY, { page: pagination.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={logs.length < pagination.pageSize}
                onClick={() => updatePagination(PAGE_KEY, { page: pagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
