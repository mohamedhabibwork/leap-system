'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, XCircle, Eye, Flag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminReports, useAdminReportsStats, useApproveReport, useRejectReport } from '@/hooks/use-admin-moderation';

export default function AdminModerationPage() {
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  // Fetch real reports from API (using tickets for now, or create reports endpoint)
  const { data: reportsData, isLoading } = useAdminReports(statusFilter);

  const reports = (reportsData?.data || []).map((report: any) => ({
    id: report.id,
    type: report.reportableType || report.type || report.category || 'unknown',
    contentId: report.reportableId || report.contentId || report.id,
    content: report.description || report.content || report.subject || '',
    reportedBy: report.reportedBy || report.user?.email || report.createdBy?.email || 'unknown',
    reason: report.reason || report.priority || 'Other',
    status: report.status || 'pending',
    createdAt: report.createdAt || new Date().toISOString(),
  }));

  // Fetch statistics
  const { data: statsData } = useAdminReportsStats(reports);

  const approveMutation = useApproveReport();
  const rejectMutation = useRejectReport();

  const handleApprove = () => {
    if (!selectedReport) return;
    approveMutation.mutate({ reportId: selectedReport.id, note: actionNote });
    setActionDialog(null);
    setActionNote('');
  };

  const handleReject = () => {
    if (!selectedReport) return;
    rejectMutation.mutate({ reportId: selectedReport.id, note: actionNote });
    setActionDialog(null);
    setActionNote('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
        <p className="text-muted-foreground mt-2">
          Review and moderate reported content
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.approved || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.rejected || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Flag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData?.today || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reported Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {report.content}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{report.reason}</Badge>
                      </TableCell>
                      <TableCell>{report.reportedBy}</TableCell>
                      <TableCell>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedReport(report);
                            setActionDialog('approve');
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedReport(report);
                            setActionDialog('reject');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </TabsContent>
            <TabsContent value="approved">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : reports.filter((r: any) => r.status === 'approved').length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No approved reports to show
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Content Preview</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.filter((r: any) => r.status === 'approved').map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Badge variant="outline">{report.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {report.content}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{report.reason}</Badge>
                        </TableCell>
                        <TableCell>{report.reportedBy}</TableCell>
                        <TableCell>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            <TabsContent value="rejected">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : reports.filter((r: any) => r.status === 'rejected').length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No rejected reports to show
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Content Preview</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.filter((r: any) => r.status === 'rejected').map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Badge variant="outline">{report.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {report.content}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{report.reason}</Badge>
                        </TableCell>
                        <TableCell>{report.reportedBy}</TableCell>
                        <TableCell>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog === 'approve' ? 'Approve Report' : 'Reject Report'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog === 'approve' 
                ? 'Approving will remove the content and may take action against the user.' 
                : 'Rejecting will dismiss this report and keep the content.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedReport && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Content:</div>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {selectedReport.content}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Note (Optional)</label>
              <Textarea
                placeholder="Add a note about this decision..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button
              variant={actionDialog === 'approve' ? 'destructive' : 'default'}
              onClick={actionDialog === 'approve' ? handleApprove : handleReject}
              disabled={isApproving || isRejecting}
            >
              {isApproving || isRejecting 
                ? 'Processing...' 
                : actionDialog === 'approve' 
                ? 'Approve & Remove Content' 
                : 'Reject Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
