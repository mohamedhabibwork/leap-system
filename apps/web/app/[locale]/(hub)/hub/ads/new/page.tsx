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

export default function CreateAdPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Ad Type
    adType: '',
    
    // Step 2: Target
    targetType: '',
    targetId: '',
    externalUrl: '',
    
    // Step 3: Content
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    mediaUrl: '',
    callToAction: '',
    
    // Step 4: Targeting
    targetUserRoles: [] as string[],
    targetSubscriptionPlans: [] as number[],
    
    // Step 5: Placement
    placementType: '',
    
    // Step 6: Schedule
    startDate: '',
    endDate: '',
    isPaid: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adMediaFile, setAdMediaFile] = useState<File | null>(null);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
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
      
      toast.success('Ad created successfully!');
      router.push('/hub/ads');
    } catch (error) {
      const message = (error as any)?.response?.data?.message || 'Failed to create ad. Please try again.';
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
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Ad</h1>
          <p className="text-muted-foreground">Step {step} of 7</p>
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
            <CardTitle>Select Ad Type</CardTitle>
            <CardDescription>Choose the format for your ad</CardDescription>
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
                      <p className="font-medium capitalize">{type}</p>
                      <p className="text-sm text-muted-foreground">
                        {type === 'banner' && 'Horizontal or vertical image ads'}
                        {type === 'sponsored' && 'Native ads that blend with content'}
                        {type === 'popup' && 'Modal ads with optional countdown'}
                        {type === 'video' && 'Video ads before content'}
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
            <CardTitle>Select Target</CardTitle>
            <CardDescription>What should this ad promote?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Target Type</Label>
              <Select value={formData.targetType} onValueChange={(value) => updateFormData('targetType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="external">External URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.targetType === 'external' ? (
              <div>
                <Label>External URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.externalUrl}
                  onChange={(e) => updateFormData('externalUrl', e.target.value)}
                />
              </div>
            ) : formData.targetType ? (
              <div>
                <Label>{formData.targetType} ID</Label>
                <Input
                  type="number"
                  placeholder={`Enter ${formData.targetType} ID`}
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
            <CardTitle>Ad Content</CardTitle>
            <CardDescription>Provide content for your ad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title (English)</Label>
              <Input
                placeholder="Your ad title"
                value={formData.titleEn}
                onChange={(e) => updateFormData('titleEn', e.target.value)}
              />
            </div>
            <div>
              <Label>Title (Arabic) - Optional</Label>
              <Input
                placeholder="عنوان الإعلان"
                value={formData.titleAr}
                onChange={(e) => updateFormData('titleAr', e.target.value)}
              />
            </div>
            <div>
              <Label>Description (English) - Optional</Label>
              <Textarea
                placeholder="Ad description"
                value={formData.descriptionEn}
                onChange={(e) => updateFormData('descriptionEn', e.target.value)}
              />
            </div>
            <div>
              <Label>Description (Arabic) - Optional</Label>
              <Textarea
                placeholder="وصف الإعلان"
                value={formData.descriptionAr}
                onChange={(e) => updateFormData('descriptionAr', e.target.value)}
              />
            </div>
            <div>
              <Label>Ad Media (Image or Video)</Label>
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
              <Label>Call to Action - Optional</Label>
              <Input
                placeholder="Learn More"
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
            <CardTitle>Targeting Rules</CardTitle>
            <CardDescription>Who should see this ad? (Optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-3 block">Target User Roles</Label>
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
                    <span className="capitalize">{role}</span>
                  </Label>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Leave empty to show ad to all users
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Placement */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Ad Placement</CardTitle>
            <CardDescription>Where should this ad appear?</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={formData.placementType} onValueChange={(value) => updateFormData('placementType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select placement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homepage_hero">Homepage Hero</SelectItem>
                <SelectItem value="courses_listing">Courses Listing</SelectItem>
                <SelectItem value="courses_sidebar">Courses Sidebar</SelectItem>
                <SelectItem value="events_listing">Events Listing</SelectItem>
                <SelectItem value="jobs_listing">Jobs Listing</SelectItem>
                <SelectItem value="social_feed">Social Feed</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Schedule */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>When should this ad run?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label>End Date (Optional)</Label>
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
              <Label htmlFor="isPaid">This is a paid ad</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Review */}
      {step === 7 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>Review your ad details before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Ad Type</Label>
              <p className="font-medium capitalize">{formData.adType}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Target</Label>
              <p className="font-medium">
                {formData.targetType === 'external' ? formData.externalUrl : `${formData.targetType} #${formData.targetId}`}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Title</Label>
              <p className="font-medium">{formData.titleEn}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Placement</Label>
              <p className="font-medium">{formData.placementType}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Schedule</Label>
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
          Previous
        </Button>
        {step < 7 ? (
          <Button onClick={nextStep}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Ad...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Create Ad
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
