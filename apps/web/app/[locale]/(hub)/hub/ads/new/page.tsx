'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Check, Upload, Loader2 } from 'lucide-react';
import { adsAPI } from '@/lib/api/ads';
import { mediaAPI } from '@/lib/api/media';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';

export default function CreateAdPage() {
  const router = useRouter();
  const t = useTranslations('ads');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // ...
  });

  // ...

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('fileSizeError'));
        return;
      }
      setAdMediaFile(file);
      updateFormData('mediaUrl', URL.createObjectURL(file));
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 7));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let mediaUrl = formData.mediaUrl;
      
      // Upload file if selected
      if (adMediaFile) {
        const uploadRes = await mediaAPI.upload(adMediaFile, 'ads');
        mediaUrl = uploadRes.url;
      }

      await adsAPI.create({
        ...formData,
        mediaUrl,
      });
      
      toast.success(t('success'));
      router.push('/hub/ads');
    } catch (error) {
      const message = (error )?.response?.data?.message || t('error');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back')}
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('createAd')}</h1>
          <p className="text-muted-foreground">{t('step', { step })}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Ad Type Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('selectAdType')}</CardTitle>
            <CardDescription>{t('chooseFormat')}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={formData.adType} onValueChange={(value) => updateFormData('adType', value)}>
              <div className="grid gap-4">
                {['banner', 'sponsored', 'popup', 'video'].map((type) => (
                  <Label
                    key={type}
                    className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent ${
                      formData.adType === type ? 'border-primary bg-accent' : ''
                    }`}
                  >
                    <RadioGroupItem value={type} />
                    <div className="flex-1">
                      <p className="font-medium capitalize">{t(type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`${type}Desc`)}
                      </p>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Target Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('selectTarget')}</CardTitle>
            <CardDescription>{t('promoteWhat')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('targetType')}</Label>
              <Select value={formData.targetType} onValueChange={(value) => updateFormData('targetType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectTargetType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">{t('course')}</SelectItem>
                  <SelectItem value="event">{t('event')}</SelectItem>
                  <SelectItem value="job">{t('job')}</SelectItem>
                  <SelectItem value="post">{t('post')}</SelectItem>
                  <SelectItem value="external">{t('external')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.targetType === 'external' ? (
              <div>
                <Label>{t('externalUrl')}</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.externalUrl}
                  onChange={(e) => updateFormData('externalUrl', e.target.value)}
                />
              </div>
            ) : formData.targetType ? (
              <div>
                <Label>{t('targetId', { type: t(formData.targetType) })}</Label>
                <Input
                  type="number"
                  placeholder={t('enterTargetId', { type: t(formData.targetType) })}
                  value={formData.targetId}
                  onChange={(e) => updateFormData('targetId', e.target.value)}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Ad Content */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('adContent')}</CardTitle>
            <CardDescription>{t('provideContent')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('titleEn')}</Label>
              <Input
                placeholder="Your ad title"
                value={formData.titleEn}
                onChange={(e) => updateFormData('titleEn', e.target.value)}
              />
            </div>
            <div>
              <Label>{t('titleAr')}</Label>
              <Input
                placeholder="عنوان الإعلان"
                value={formData.titleAr}
                onChange={(e) => updateFormData('titleAr', e.target.value)}
              />
            </div>
            <div>
              <Label>{t('descriptionEn')}</Label>
              <Textarea
                placeholder="Ad description"
                value={formData.descriptionEn}
                onChange={(e) => updateFormData('descriptionEn', e.target.value)}
              />
            </div>
            <div>
              <Label>{t('descriptionAr')}</Label>
              <Textarea
                placeholder="وصف الإعلان"
                value={formData.descriptionAr}
                onChange={(e) => updateFormData('descriptionAr', e.target.value)}
              />
            </div>
            <div>
              <Label>{t('media')}</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {adMediaFile && (
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                )}
              </div>
              {formData.mediaUrl && (
                <div className="mt-4 aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                  {adMediaFile?.type.startsWith('video/') ? (
                    <video src={formData.mediaUrl} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={formData.mediaUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                  )}
                </div>
              )}
            </div>
            <div>
              <Label>{t('cta')}</Label>
              <Input
                placeholder={t('ctaPlaceholder')}
                value={formData.callToAction}
                onChange={(e) => updateFormData('callToAction', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Targeting Rules */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('targetingRules')}</CardTitle>
            <CardDescription>{t('whoSeeAd')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-3 block">{t('targetUserRoles')}</Label>
              <div className="space-y-2">
                {['admin', 'instructor', 'user'].map((role) => (
                  <Label key={role} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.targetUserRoles.includes(role)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData('targetUserRoles', [...formData.targetUserRoles, role]);
                        } else {
                          updateFormData(
                            'targetUserRoles',
                            formData.targetUserRoles.filter((r) => r !== role)
                          );
                        }
                      }}
                    />
                    <span className="capitalize">{t(`roles.${role}`)}</span>
                  </Label>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('allUsersHint')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Placement */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('adPlacement')}</CardTitle>
            <CardDescription>{t('whereAppear')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={formData.placementType} onValueChange={(value) => updateFormData('placementType', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectPlacement')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homepage_hero">{t('placements.homepage_hero')}</SelectItem>
                <SelectItem value="courses_listing">{t('placements.courses_listing')}</SelectItem>
                <SelectItem value="courses_sidebar">{t('placements.courses_sidebar')}</SelectItem>
                <SelectItem value="events_listing">{t('placements.events_listing')}</SelectItem>
                <SelectItem value="jobs_listing">{t('placements.jobs_listing')}</SelectItem>
                <SelectItem value="social_feed">{t('placements.social_feed')}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Schedule */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('schedule')}</CardTitle>
            <CardDescription>{t('whenRun')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('startDate')}</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label>{t('endDate')}</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData('endDate', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) => updateFormData('isPaid', checked)}
              />
              <Label htmlFor="isPaid">{t('isPaid')}</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Review */}
      {step === 7 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('reviewSubmit')}</CardTitle>
            <CardDescription>{t('reviewDetails')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-muted-foreground">{t('adType')}</Label>
              <p className="font-medium capitalize">{t(formData.adType)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('target')}</Label>
              <p className="font-medium">
                {formData.targetType === 'external' ? formData.externalUrl : `${t(formData.targetType)} #${formData.targetId}`}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('titleEn')}</Label>
              <p className="font-medium">{formData.titleEn}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('placement')}</Label>
              <p className="font-medium">{t(`placements.${formData.placementType}`)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('schedule')}</Label>
              <p className="font-medium">
                {formData.startDate} {formData.endDate && `- ${formData.endDate}`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={step === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('previous')}
        </Button>
        {step < 7 ? (
          <Button onClick={nextStep}>
            {t('next')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('creating')}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t('createButton')}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
