'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Bell, Send, BarChart3, Users, Mail, Smartphone, MessageSquare, TestTube } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function AdminNotificationsPage() {
  const [testEmail, setTestEmail] = useState('');
  const [testToken, setTestToken] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [bulkNotification, setBulkNotification] = useState({
    title: '',
    message: '',
    linkUrl: '',
    notificationType: 'system',
  });

  const handleSendTestEmail = async () => {
    if (!testEmail || !testToken) {
      toast.error('Please provide both email and FCM token');
      return;
    }

    setIsSending(true);
    try {
      const response = await apiClient.post('/notifications/send-test', { token: testToken });
      toast.success('Test notification sent successfully!');
    } catch (error) {
      toast.error('Failed to send test notification');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container max-w-7xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage the notification system
        </p>
      </div>

      <Tabs defaultValue="statistics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="statistics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="test">
            <TestTube className="mr-2 h-4 w-4" />
            Test Notifications
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Send className="mr-2 h-4 w-4" />
            Bulk Send
          </TabsTrigger>
        </TabsList>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,345</div>
                <p className="text-xs text-muted-foreground">
                  +20% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Sent</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,432</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Push Sent</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6,892</div>
                <p className="text-xs text-muted-foreground">
                  +25% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,421</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notification Type Breakdown</CardTitle>
              <CardDescription>Distribution of notifications by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Social Interactions</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">4,523</span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>LMS Updates</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">3,234</span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Job Applications</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">2,103</span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>System Notifications</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">1,432</span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Notifications Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Push Notification</CardTitle>
              <CardDescription>
                Test the FCM push notification system with a specific device token
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="user@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-token">FCM Device Token</Label>
                <Textarea
                  id="test-token"
                  placeholder="Paste FCM device token here..."
                  value={testToken}
                  onChange={(e) => setTestToken(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleSendTestEmail} disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Test Notification'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device Token Information</CardTitle>
              <CardDescription>
                Users can find their device tokens in their notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                To get a device token for testing:
              </p>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 mt-2">
                <li>Open the app on a device</li>
                <li>Enable push notifications when prompted</li>
                <li>Go to Settings → Notifications</li>
                <li>Copy the device token from the developer section</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Send Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Bulk Notification</CardTitle>
              <CardDescription>
                Send notifications to multiple users at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-type">Notification Type</Label>
                <Select
                  value={bulkNotification.notificationType}
                  onValueChange={(value) =>
                    setBulkNotification({ ...bulkNotification, notificationType: value })
                  }
                >
                  <SelectTrigger id="bulk-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Announcement</SelectItem>
                    <SelectItem value="lms">LMS Update</SelectItem>
                    <SelectItem value="social">Social Update</SelectItem>
                    <SelectItem value="jobs">Jobs Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-title">Title</Label>
                <Input
                  id="bulk-title"
                  placeholder="Notification title"
                  value={bulkNotification.title}
                  onChange={(e) =>
                    setBulkNotification({ ...bulkNotification, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-message">Message</Label>
                <Textarea
                  id="bulk-message"
                  placeholder="Notification message"
                  value={bulkNotification.message}
                  onChange={(e) =>
                    setBulkNotification({ ...bulkNotification, message: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-link">Link URL (optional)</Label>
                <Input
                  id="bulk-link"
                  placeholder="/announcements/1"
                  value={bulkNotification.linkUrl}
                  onChange={(e) =>
                    setBulkNotification({ ...bulkNotification, linkUrl: e.target.value })
                  }
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Warning:</strong> Bulk notifications will be sent to all active users.
                  Please use this feature carefully.
                </p>
              </div>

              <Button variant="default" size="lg">
                <Send className="mr-2 h-4 w-4" />
                Send to All Users
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
