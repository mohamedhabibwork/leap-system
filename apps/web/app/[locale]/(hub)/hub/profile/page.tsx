'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { useProfile, useUpdateProfile, useUploadAvatar, useUploadCoverPhoto, useChangePassword } from '@/lib/hooks/use-profile';
import { Loader2, Eye, EyeOff, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import Image from 'next/image';

export default function ProfilePage() {
  const t = useTranslations('common.profile');
  const tCommon = useTranslations('common');
  const { data: user, isLoading } = useProfile();
  
  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const uploadCoverPhotoMutation = useUploadCoverPhoto();
  const changePasswordMutation = useChangePassword();

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    phone: '',
    timezone: '',
    dateOfBirth: '',
    gender: '',
    location: '',
    website: '',
    preferredLanguage: 'en',
    coverPhoto: '',
  });

  // Cover photo state
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });


  // Initialize form data when user data loads
  useEffect(() => {
    if (user?.data) {
      const userData = user.data;
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        bio: userData.bio || '',
        phone: userData.phone || '',
        timezone: userData.timezone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        location: userData.location || '',
        website: userData.website || '',
        preferredLanguage: userData.preferredLanguage || 'en',
        coverPhoto: userData.coverPhoto || '',
      });
      setCoverPhotoPreview(userData.coverPhoto || null);
    }
  }, [user]);

  // Handle cover photo file select
  const handleCoverPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file using the mutation
    try {
      await uploadCoverPhotoMutation.mutateAsync(file);
    } catch (error) {
      // Error handled by mutation
      setCoverPhotoPreview(null);
    }
  };

  const removeCoverPhoto = () => {
    setCoverPhotoPreview(null);
    setFormData({ ...formData, coverPhoto: '' });
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        phone: formData.phone,
        timezone: formData.timezone,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        location: formData.location || undefined,
        website: formData.website || undefined,
        preferredLanguage: formData.preferredLanguage,
        coverPhoto: formData.coverPhoto || undefined,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatarMutation.mutateAsync(file);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('settingsDesc')}
        </p>
      </div>

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">{t('tabs.about')}</TabsTrigger>
          <TabsTrigger value="security">{t('tabs.security')}</TabsTrigger>
          <TabsTrigger value="activity">{t('tabs.activity')}</TabsTrigger>
          <TabsTrigger value="certificates">{t('tabs.certificates')}</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('information')}</CardTitle>
              <CardDescription>
                {t('informationDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Cover Photo */}
                <div className="space-y-2">
                  <Label htmlFor="coverPhoto">{t('coverPhoto') || 'Cover Photo'}</Label>
                  {coverPhotoPreview || formData.coverPhoto ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={coverPhotoPreview || formData.coverPhoto || ''}
                        alt="Cover photo"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeCoverPhoto}
                        disabled={isUploadingCover}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="coverPhoto"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverPhotoSelect}
                        disabled={isUploadingCover}
                        className="text-start"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => document.getElementById('coverPhoto')?.click()}
                        disabled={uploadCoverPhotoMutation.isPending}
                      >
                        {uploadCoverPhotoMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                  {uploadCoverPhotoMutation.isPending && (
                    <p className="text-xs text-muted-foreground">
                      Uploading cover photo...
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('coverPhotoHint') || 'JPG, PNG or GIF. Max size 5MB'}
                  </p>
                </div>

                {/* Avatar Upload */}
                <AvatarUpload
                  currentAvatar={user?.data?.avatarUrl}
                  userName={`${user?.data?.firstName || ''} ${user?.data?.lastName || ''}`}
                  onUpload={handleAvatarUpload}
                  uploading={uploadAvatarMutation.isPending}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('firstName')}</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('lastName')}</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('emailHint')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t('bio')}</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={4}
                    placeholder={t('bioPlaceholder')}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t('dateOfBirth') || 'Date of Birth'}</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({ ...formData, dateOfBirth: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('gender') || 'Gender'}</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder={t('selectGender') || 'Select gender'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('male') || 'Male'}</SelectItem>
                        <SelectItem value="female">{t('female') || 'Female'}</SelectItem>
                        <SelectItem value="other">{t('other') || 'Other'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('location') || 'Location'}</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder={t('locationPlaceholder') || 'City, Country'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">{t('website') || 'Website'}</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t('timezone')}</Label>
                    <Input
                      id="timezone"
                      value={formData.timezone}
                      onChange={(e) =>
                        setFormData({ ...formData, timezone: e.target.value })
                      }
                      placeholder="UTC"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">{t('preferredLanguage') || 'Preferred Language'}</Label>
                  <Select
                    value={formData.preferredLanguage}
                    onValueChange={(value) =>
                      setFormData({ ...formData, preferredLanguage: value })
                    }
                  >
                    <SelectTrigger id="preferredLanguage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('english') || 'English'}</SelectItem>
                      <SelectItem value="ar">{t('arabic') || 'Arabic'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-start">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('saving')}
                      </>
                    ) : (
                      t('saveChanges')
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t('changePassword')}</CardTitle>
              <CardDescription>{t('changePasswordDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('newPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-start">
                  <Button type="submit" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('changing')}
                      </>
                    ) : (
                      t('changePassword')
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>{t('tabs.activity')}</CardTitle>
              <CardDescription>{t('noActivity')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('noActivity')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>{t('myCertificates')}</CardTitle>
              <CardDescription>{t('certificatesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('completeCourses')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
