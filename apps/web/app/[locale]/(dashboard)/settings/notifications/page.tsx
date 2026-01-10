'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNotificationPreferences } from '@/lib/hooks/use-notification-preferences';
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, Wifi, Save, Loader2 } from 'lucide-react';

export default function NotificationSettingsPage() {
  const { preferences, isLoading, update, isUpdating } = useNotificationPreferences();
  const [localPrefs, setLocalPrefs] = useState(preferences);

  // Update local state when preferences load
  useState(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  });

  const handleToggle = (key: string, value: boolean) => {
    setLocalPrefs((prev) => ({
      ...prev!,
      [key]: value,
    }));
  };

  const handleCategoryToggle = (category: string, channel: string, value: boolean) => {
    setLocalPrefs((prev) => ({
      ...prev!,
      categories: {
        ...prev!.categories,
        [category]: {
          ...prev!.categories[category as keyof typeof prev.categories],
          [channel]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    try {
      await update(localPrefs!);
      toast.success('Notification preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update preferences');
      console.error(error);
    }
  };

  if (isLoading || !localPrefs) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Global Settings
          </CardTitle>
          <CardDescription>
            Master controls for all notification channels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={localPrefs.emailEnabled}
              onCheckedChange={(value) => handleToggle('emailEnabled', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on your devices
              </p>
            </div>
            <Switch
              checked={localPrefs.pushEnabled}
              onCheckedChange={(value) => handleToggle('pushEnabled', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Real-time Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive instant notifications while browsing
              </p>
            </div>
            <Switch
              checked={localPrefs.websocketEnabled}
              onCheckedChange={(value) => handleToggle('websocketEnabled', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Notifications - Granular Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Social Notifications</CardTitle>
          <CardDescription>
            Control which social interactions trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>When someone likes my post</Label>
            <Switch
              checked={localPrefs.notifyOnPostLikes}
              onCheckedChange={(value) => handleToggle('notifyOnPostLikes', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>When someone comments on my post</Label>
            <Switch
              checked={localPrefs.notifyOnComments}
              onCheckedChange={(value) => handleToggle('notifyOnComments', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>When someone replies to my comment</Label>
            <Switch
              checked={localPrefs.notifyOnCommentReplies}
              onCheckedChange={(value) => handleToggle('notifyOnCommentReplies', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>When someone shares my content</Label>
            <Switch
              checked={localPrefs.notifyOnShares}
              onCheckedChange={(value) => handleToggle('notifyOnShares', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>When someone mentions me (@username)</Label>
            <Switch
              checked={localPrefs.notifyOnMentions}
              onCheckedChange={(value) => handleToggle('notifyOnMentions', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Friend requests</Label>
            <Switch
              checked={localPrefs.notifyOnFriendRequests}
              onCheckedChange={(value) => handleToggle('notifyOnFriendRequests', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Friend request accepted</Label>
            <Switch
              checked={localPrefs.notifyOnFriendRequestAccepted}
              onCheckedChange={(value) => handleToggle('notifyOnFriendRequestAccepted', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Group activity (for admins)</Label>
            <Switch
              checked={localPrefs.notifyOnGroupJoins}
              onCheckedChange={(value) => handleToggle('notifyOnGroupJoins', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Page follows/likes</Label>
            <Switch
              checked={localPrefs.notifyOnPageFollows}
              onCheckedChange={(value) => handleToggle('notifyOnPageFollows', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label>Event invitations</Label>
            <Switch
              checked={localPrefs.notifyOnEventInvitations}
              onCheckedChange={(value) => handleToggle('notifyOnEventInvitations', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Category-specific Channel Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels by Category</CardTitle>
          <CardDescription>
            Customize notification channels for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(localPrefs.categories).map(([category, channels]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="capitalize">
                  {category} Notifications
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Switch
                      checked={channels.email}
                      onCheckedChange={(value) => handleCategoryToggle(category, 'email', value)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Push
                    </Label>
                    <Switch
                      checked={channels.push}
                      onCheckedChange={(value) => handleCategoryToggle(category, 'push', value)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      Real-time
                    </Label>
                    <Switch
                      checked={channels.websocket}
                      onCheckedChange={(value) => handleCategoryToggle(category, 'websocket', value)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isUpdating} size="lg">
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
