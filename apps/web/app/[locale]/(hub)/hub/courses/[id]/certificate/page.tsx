'use client';

import { use } from 'react';
import { useCourse } from '@/lib/hooks/use-api';
import { certificatesAPI } from '@/lib/api/certificates';
import {
  useCourseCertificate,
  useGenerateCertificate,
  useSendCertificateEmail,
} from '@/hooks/use-certificates';
import { PageLoader } from '@/components/loading/page-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  User,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/auth.store';

export default function CourseCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('courses.certificate');
  const router = useRouter();
  const { id } = use(params);
  const courseId = parseInt(id);
  const { user } = useAuthStore();

  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId);

  // Fetch certificate
  const { data: certificate, isLoading: isLoadingCertificate } = useCourseCertificate(courseId);

  const generateCertificateMutation = useGenerateCertificate(courseId);
  const sendEmailMutation = useSendCertificateEmail();

  if (isLoadingCourse || isLoadingCertificate) {
    return <PageLoader message={t('loading')} />;
  }

  if (!course) {
    return <div>{t('courseNotFound')}</div>;
  }

  const courseData = course as any;
  const hasCertificate = certificate?.url;

  const handleDownload = () => {
    if (!certificate?.certificateId) return;
    const downloadUrl = certificatesAPI.download(certificate.certificateId);
    window.open(downloadUrl, '_blank');
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(
      `I just completed the course "${courseData.titleEn}"! Check out my certificate.`,
    );
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
    );
  };

  const handleVerify = () => {
    if (!certificate?.certificateId) return;
    const verifyUrl = `${window.location.origin}/verify/certificate/${certificate.certificateId}`;
    window.open(verifyUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/hub/courses/${courseId}`)}
            className="mb-4"
          >
            ← {t('backToCourse')}
          </Button>
          <h1 className="text-3xl font-bold mb-2">{t('certificate')}</h1>
          <p className="text-muted-foreground">{courseData.titleEn}</p>
        </div>

        {!hasCertificate ? (
          <Card className="p-12 text-center">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{t('noCertificate')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('generateCertificateDescription')}
            </p>
            <Button
              onClick={() =>
                generateCertificateMutation.mutate(undefined, {
                  onSuccess: () => {
                    // Refetch certificate
                    window.location.reload();
                  },
                })
              }
              disabled={generateCertificateMutation.isPending}
              size="lg"
            >
              {generateCertificateMutation.isPending
                ? t('generating')
                : t('generateCertificate')}
            </Button>
          </Card>
        ) : (
          <>
            {/* Certificate Preview */}
            <Card className="p-8 mb-6 border-2 border-primary/20">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-4">
                    <Award className="h-16 w-16 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{t('certificateOfCompletion')}</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    {t('awardedTo')}
                  </p>
                  <div className="text-2xl font-semibold mb-2">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {t('forCompleting')} <strong>{courseData.titleEn}</strong>
                  </p>
                </div>
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {certificate?.issuedAt
                        ? format(new Date(certificate.issuedAt), 'PP')
                        : format(new Date(), 'PP')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{t('verified')}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Certificate Details */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">{t('certificateDetails')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{t('recipient')}</span>
                  </div>
                  <span className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{t('course')}</span>
                  </div>
                  <span className="font-medium">{courseData.titleEn}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{t('issueDate')}</span>
                  </div>
                  <span className="font-medium">
                    {certificate?.issuedAt
                      ? format(new Date(certificate.issuedAt), 'PPp')
                      : format(new Date(), 'PPp')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t('verification')}</span>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    {t('verified')}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleDownload} size="lg" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                {t('downloadPDF')}
              </Button>
              <Button
                onClick={handleShareLinkedIn}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {t('shareLinkedIn')}
              </Button>
              <Button
                onClick={handleVerify}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('verifyCertificate')}
              </Button>
              <Button
                onClick={() => {
                  if (!certificate?.certificateId) return;
                  sendEmailMutation.mutate(certificate.certificateId);
                }}
                variant="outline"
                size="lg"
                disabled={sendEmailMutation.isPending || !certificate?.certificateId}
              >
                {sendEmailMutation.isPending ? t('sending') : t('sendEmail')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
