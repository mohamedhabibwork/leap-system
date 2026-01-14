'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, Users, BarChart3, Eye, Heart, Share2, TrendingUp } from 'lucide-react';
import { PageAnalytics } from './page-analytics';
import { PageFollowerList } from './page-follower-list';
import { toast } from 'sonner';

interface PageAdminPanelProps {
  pageId: number;
  isAdmin: boolean;
}

export function PageAdminPanel({ pageId, isAdmin }: PageAdminPanelProps) {
  const t = useTranslations('pages');
  const [activeTab, setActiveTab] = useState('analytics');

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('admin.title')}
        </CardTitle>
        <CardDescription>{t('admin.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">{t('admin.analytics')}</TabsTrigger>
            <TabsTrigger value="followers">{t('admin.followers')}</TabsTrigger>
            <TabsTrigger value="settings">{t('admin.settings')}</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <PageAnalytics pageId={pageId} />
          </TabsContent>

          <TabsContent value="followers" className="space-y-4">
            <PageFollowerList pageId={pageId} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <PageSettings pageId={pageId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Page Settings Component
function PageSettings({ pageId }: { pageId: number }) {
  const t = useTranslations('pages');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [requireModeration, setRequireModeration] = useState(false);

  const handleSave = () => {
    // API call to update page settings
    toast.success(t('admin.settingsSaved'));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="page-name">{t('admin.pageName')}</Label>
        <Input
          id="page-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('admin.pageNamePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="page-description">{t('admin.description')}</Label>
        <Textarea
          id="page-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('admin.descriptionPlaceholder')}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="page-category">{t('admin.category')}</Label>
          <Input
            id="page-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t('admin.categoryPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="page-website">{t('admin.website')}</Label>
          <Input
            id="page-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="page-email">{t('admin.email')}</Label>
          <Input
            id="page-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="page-phone">{t('admin.phone')}</Label>
          <Input
            id="page-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('admin.allowComments')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('admin.allowCommentsDescription')}
            </p>
          </div>
          <Switch checked={allowComments} onCheckedChange={setAllowComments} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('admin.requireModeration')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('admin.requireModerationDescription')}
            </p>
          </div>
          <Switch checked={requireModeration} onCheckedChange={setRequireModeration} />
        </div>
      </div>

      <Button onClick={handleSave}>{t('admin.saveChanges')}</Button>
    </div>
  );
}
