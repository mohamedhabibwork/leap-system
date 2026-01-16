'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/admin/shared/rich-text-editor';
import { ImageUpload } from '@/components/admin/shared/image-upload';
import { useAdminCmsPages } from '@/lib/hooks/use-admin-api';
import { generateSlug } from '@/lib/utils/slug';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface CMSPageForm {
  titleEn: string;
  titleAr: string;
  slug: string;
  contentEn: string;
  contentAr: string;
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescriptionEn?: string;
  metaDescriptionAr?: string;
  metaKeywords?: string;
  featuredImageUrl?: string;
  pageTypeId?: number;
  isPublished: boolean;
  isFeatured: boolean;
}

export default function NewCMSPagePage() {
  const router = useRouter();
  const { useCreate } = useAdminCmsPages();
  const createMutation = useCreate();

  const [form, setForm] = useState<CMSPageForm>({
    titleEn: '',
    titleAr: '',
    slug: '',
    contentEn: '',
    contentAr: '',
    metaTitleEn: '',
    metaTitleAr: '',
    metaDescriptionEn: '',
    metaDescriptionAr: '',
    metaKeywords: '',
    featuredImageUrl: '',
    pageTypeId: undefined,
    isPublished: false,
    isFeatured: false,
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'ar'>('en');

  const updateField = (field: keyof CMSPageForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (value: string) => {
    updateField('titleEn', value);
    if (!form.slug) {
      updateField('slug', generateSlug(value));
    }
  };

  const handleSave = async (publish: boolean) => {
    try {
      // Validation
      if (!form.titleEn) {
        toast.error('English title is required');
        return;
      }

      if (!form.slug) {
        toast.error('Slug is required');
        return;
      }

      if (!form.contentEn) {
        toast.error('English content is required');
        return;
      }

      const data = {
        ...form,
        isPublished: publish,
      };

      await createMutation.mutateAsync(data);

      toast.success(
        publish ? 'Page published successfully' : 'Page saved as draft'
      );

      router.push('/admin/cms-pages');
    } catch (error) {
      toast.error('Failed to save page');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New CMS Page</h1>
            <p className="text-muted-foreground mt-1">
              Create a new content page
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={createMutation.isPending}
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={createMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Preview Mode */}
      {previewMode ? (
        <Card>
          <CardContent className="p-8">
            <h1 className="text-4xl font-bold mb-4">
              {activeLanguage === 'en' ? form.titleEn : form.titleAr}
            </h1>
            {form.featuredImageUrl && (
              <img
                src={form.featuredImageUrl}
                alt={form.titleEn}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: activeLanguage === 'en' ? form.contentEn : form.contentAr,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Bilingual Tabs */}
          <Tabs value={activeLanguage} onValueChange={(v) => setActiveLanguage(v as 'en' | 'ar')}>
            <TabsList>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="ar">Arabic</TabsTrigger>
            </TabsList>

            {/* English Content */}
            <TabsContent value="en" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information (English)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleEn">Title *</Label>
                    <Input
                      id="titleEn"
                      value={form.titleEn}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter page title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) => updateField('slug', e.target.value)}
                      placeholder="page-slug"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL-friendly version of the title
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Featured Image</Label>
                    <ImageUpload
                      value={form.featuredImageUrl}
                      onChange={(url) => updateField('featuredImageUrl', url as string)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content (English) *</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={form.contentEn}
                    onChange={(value) => updateField('contentEn', value)}
                    placeholder="Write your content here..."
                    minHeight="400px"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings (English)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitleEn">Meta Title</Label>
                    <Input
                      id="metaTitleEn"
                      value={form.metaTitleEn}
                      onChange={(e) => updateField('metaTitleEn', e.target.value)}
                      placeholder="SEO title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescriptionEn">Meta Description</Label>
                    <Input
                      id="metaDescriptionEn"
                      value={form.metaDescriptionEn}
                      onChange={(e) => updateField('metaDescriptionEn', e.target.value)}
                      placeholder="SEO description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                    <Input
                      id="metaKeywords"
                      value={form.metaKeywords}
                      onChange={(e) => updateField('metaKeywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Arabic Content */}
            <TabsContent value="ar" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information (Arabic)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleAr">العنوان</Label>
                    <Input
                      id="titleAr"
                      value={form.titleAr}
                      onChange={(e) => updateField('titleAr', e.target.value)}
                      placeholder="أدخل عنوان الصفحة"
                      dir="rtl"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>المحتوى (Arabic)</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={form.contentAr}
                    onChange={(value) => updateField('contentAr', value)}
                    placeholder="اكتب المحتوى هنا..."
                    minHeight="400px"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إعدادات SEO (Arabic)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitleAr">عنوان الميتا</Label>
                    <Input
                      id="metaTitleAr"
                      value={form.metaTitleAr}
                      onChange={(e) => updateField('metaTitleAr', e.target.value)}
                      placeholder="عنوان SEO"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescriptionAr">وصف الميتا</Label>
                    <Input
                      id="metaDescriptionAr"
                      value={form.metaDescriptionAr}
                      onChange={(e) => updateField('metaDescriptionAr', e.target.value)}
                      placeholder="وصف SEO"
                      dir="rtl"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublished">Published</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this page visible to the public
                  </p>
                </div>
                <Switch
                  id="isPublished"
                  checked={form.isPublished}
                  onCheckedChange={(checked) => updateField('isPublished', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isFeatured">Featured</Label>
                  <p className="text-sm text-muted-foreground">
                    Show this page in featured sections
                  </p>
                </div>
                <Switch
                  id="isFeatured"
                  checked={form.isFeatured}
                  onCheckedChange={(checked) => updateField('isFeatured', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
