'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Cloud,
  Mail,
  MessageSquare,
  CreditCard,
  FileText,
  Bell,
  Database,
  Settings,
  Check,
  X,
} from 'lucide-react';
import { useSystemSettings, useUpdateSettings } from '@/lib/hooks/use-admin-api';
import { PageLoader } from '@/components/loading/page-loader';

interface IntegrationConfig {
  enabled: boolean;
  apiKey?: string;
  secretKey?: string;
  webhookUrl?: string;
  [key: string]: any;
}

export default function IntegrationsPage() {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettings = useUpdateSettings();

  const handleToggle = (integration: string, enabled: boolean) => {
    updateSettings.mutate(
      {
        integrations: {
          ...settings?.integrations,
          [integration]: {
            ...settings?.integrations?.[integration],
            enabled,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(`${integration} ${enabled ? 'enabled' : 'disabled'}`);
        },
        onError: () => {
          toast.error('Failed to update integration');
        },
      }
    );
  };

  const handleSaveConfig = (integration: string, config: Partial<IntegrationConfig>) => {
    updateSettings.mutate(
      {
        integrations: {
          ...settings?.integrations,
          [integration]: {
            ...settings?.integrations?.[integration],
            ...config,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success('Configuration saved successfully');
        },
        onError: () => {
          toast.error('Failed to save configuration');
        },
      }
    );
  };

  if (isLoading) {
    return <PageLoader message="Loading integrations..." />;
  }

  const integrations = settings?.integrations || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your platform with external services
        </p>
      </div>

      <Tabs defaultValue="payment">
        <TabsList>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Payment Integrations */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <CardTitle>Stripe</CardTitle>
                  {integrations.stripe?.enabled && (
                    <Badge variant="default" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>Accept payments with Stripe</CardDescription>
              </div>
              <Switch
                checked={integrations.stripe?.enabled || false}
                onCheckedChange={(checked) => handleToggle('stripe', checked)}
              />
            </CardHeader>
            {integrations.stripe?.enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-public-key">Publishable Key</Label>
                  <Input
                    id="stripe-public-key"
                    placeholder="pk_live_..."
                    defaultValue={integrations.stripe?.publicKey || ''}
                    onBlur={(e) =>
                      handleSaveConfig('stripe', { publicKey: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripe-secret-key">Secret Key</Label>
                  <Input
                    id="stripe-secret-key"
                    type="password"
                    placeholder="sk_live_..."
                    defaultValue={integrations.stripe?.secretKey || ''}
                    onBlur={(e) =>
                      handleSaveConfig('stripe', { secretKey: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripe-webhook">Webhook URL</Label>
                  <Input
                    id="stripe-webhook"
                    placeholder="https://your-domain.com/webhooks/stripe"
                    defaultValue={integrations.stripe?.webhookUrl || ''}
                    readOnly
                  />
                </div>
                <Button variant="outline" size="sm">
                  Test Connection
                </Button>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <CardTitle>PayPal</CardTitle>
                  {integrations.paypal?.enabled && (
                    <Badge variant="default" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>Accept payments with PayPal</CardDescription>
              </div>
              <Switch
                checked={integrations.paypal?.enabled || false}
                onCheckedChange={(checked) => handleToggle('paypal', checked)}
              />
            </CardHeader>
            {integrations.paypal?.enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paypal-client-id">Client ID</Label>
                  <Input
                    id="paypal-client-id"
                    placeholder="AYjfX..."
                    defaultValue={integrations.paypal?.clientId || ''}
                    onBlur={(e) =>
                      handleSaveConfig('paypal', { clientId: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paypal-secret">Secret</Label>
                  <Input
                    id="paypal-secret"
                    type="password"
                    placeholder="ELjf..."
                    defaultValue={integrations.paypal?.secret || ''}
                    onBlur={(e) =>
                      handleSaveConfig('paypal', { secret: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Email Integrations */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <CardTitle>SendGrid</CardTitle>
                  {integrations.sendgrid?.enabled && (
                    <Badge variant="default" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>Send transactional emails</CardDescription>
              </div>
              <Switch
                checked={integrations.sendgrid?.enabled || false}
                onCheckedChange={(checked) => handleToggle('sendgrid', checked)}
              />
            </CardHeader>
            {integrations.sendgrid?.enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sendgrid-api-key">API Key</Label>
                  <Input
                    id="sendgrid-api-key"
                    type="password"
                    placeholder="SG.xxx..."
                    defaultValue={integrations.sendgrid?.apiKey || ''}
                    onBlur={(e) =>
                      handleSaveConfig('sendgrid', { apiKey: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sendgrid-from">From Email</Label>
                  <Input
                    id="sendgrid-from"
                    type="email"
                    placeholder="noreply@yourdomain.com"
                    defaultValue={integrations.sendgrid?.fromEmail || ''}
                    onBlur={(e) =>
                      handleSaveConfig('sendgrid', { fromEmail: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Storage Integrations */}
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  <CardTitle>Cloudflare R2</CardTitle>
                  {integrations.cloudflare?.enabled && (
                    <Badge variant="default" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>Object storage for media files</CardDescription>
              </div>
              <Switch
                checked={integrations.cloudflare?.enabled || false}
                onCheckedChange={(checked) => handleToggle('cloudflare', checked)}
              />
            </CardHeader>
            {integrations.cloudflare?.enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cf-account-id">Account ID</Label>
                  <Input
                    id="cf-account-id"
                    placeholder="xxx..."
                    defaultValue={integrations.cloudflare?.accountId || ''}
                    onBlur={(e) =>
                      handleSaveConfig('cloudflare', { accountId: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cf-access-key">Access Key ID</Label>
                  <Input
                    id="cf-access-key"
                    placeholder="xxx..."
                    defaultValue={integrations.cloudflare?.accessKeyId || ''}
                    onBlur={(e) =>
                      handleSaveConfig('cloudflare', { accessKeyId: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cf-secret-key">Secret Access Key</Label>
                  <Input
                    id="cf-secret-key"
                    type="password"
                    placeholder="xxx..."
                    defaultValue={integrations.cloudflare?.secretAccessKey || ''}
                    onBlur={(e) =>
                      handleSaveConfig('cloudflare', { secretAccessKey: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cf-bucket">Bucket Name</Label>
                  <Input
                    id="cf-bucket"
                    placeholder="my-bucket"
                    defaultValue={integrations.cloudflare?.bucketName || ''}
                    onBlur={(e) =>
                      handleSaveConfig('cloudflare', { bucketName: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  <CardTitle>MinIO</CardTitle>
                  {integrations.minio?.enabled && (
                    <Badge variant="default" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>Self-hosted object storage</CardDescription>
              </div>
              <Switch
                checked={integrations.minio?.enabled || false}
                onCheckedChange={(checked) => handleToggle('minio', checked)}
              />
            </CardHeader>
            {integrations.minio?.enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minio-endpoint">Endpoint</Label>
                  <Input
                    id="minio-endpoint"
                    placeholder="http://localhost:9000"
                    defaultValue={integrations.minio?.endpoint || ''}
                    onBlur={(e) =>
                      handleSaveConfig('minio', { endpoint: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minio-access-key">Access Key</Label>
                  <Input
                    id="minio-access-key"
                    defaultValue={integrations.minio?.accessKey || ''}
                    onBlur={(e) =>
                      handleSaveConfig('minio', { accessKey: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minio-secret-key">Secret Key</Label>
                  <Input
                    id="minio-secret-key"
                    type="password"
                    defaultValue={integrations.minio?.secretKey || ''}
                    onBlur={(e) =>
                      handleSaveConfig('minio', { secretKey: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Communication Integrations */}
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle>Slack</CardTitle>
                  {integrations.slack?.enabled && (
                    <Badge variant="default" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>Send notifications to Slack</CardDescription>
              </div>
              <Switch
                checked={integrations.slack?.enabled || false}
                onCheckedChange={(checked) => handleToggle('slack', checked)}
              />
            </CardHeader>
            {integrations.slack?.enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack-webhook">Webhook URL</Label>
                  <Input
                    id="slack-webhook"
                    placeholder="https://hooks.slack.com/services/..."
                    defaultValue={integrations.slack?.webhookUrl || ''}
                    onBlur={(e) =>
                      handleSaveConfig('slack', { webhookUrl: e.target.value })
                    }
                  />
                </div>
                <Button variant="outline" size="sm">
                  Send Test Message
                </Button>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Firebase Cloud Messaging</CardTitle>
                  {integrations.fcm?.enabled && (
                    <Badge variant="default" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>Push notifications for mobile apps</CardDescription>
              </div>
              <Switch
                checked={integrations.fcm?.enabled || false}
                onCheckedChange={(checked) => handleToggle('fcm', checked)}
              />
            </CardHeader>
            {integrations.fcm?.enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fcm-server-key">Server Key</Label>
                  <Input
                    id="fcm-server-key"
                    type="password"
                    placeholder="AAAA..."
                    defaultValue={integrations.fcm?.serverKey || ''}
                    onBlur={(e) =>
                      handleSaveConfig('fcm', { serverKey: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fcm-sender-id">Sender ID</Label>
                  <Input
                    id="fcm-sender-id"
                    placeholder="123456789"
                    defaultValue={integrations.fcm?.senderId || ''}
                    onBlur={(e) =>
                      handleSaveConfig('fcm', { senderId: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Analytics Integrations */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <CardTitle>Google Analytics</CardTitle>
                  {integrations.googleAnalytics?.enabled && (
                    <Badge variant="default" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>Track user behavior and analytics</CardDescription>
              </div>
              <Switch
                checked={integrations.googleAnalytics?.enabled || false}
                onCheckedChange={(checked) => handleToggle('googleAnalytics', checked)}
              />
            </CardHeader>
            {integrations.googleAnalytics?.enabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ga-tracking-id">Tracking ID</Label>
                  <Input
                    id="ga-tracking-id"
                    placeholder="G-XXXXXXXXXX"
                    defaultValue={integrations.googleAnalytics?.trackingId || ''}
                    onBlur={(e) =>
                      handleSaveConfig('googleAnalytics', { trackingId: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
