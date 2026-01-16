'use client';

import { use, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCourse } from '@/lib/hooks/use-api';
import { certificatesAPI } from '@/lib/api/certificates';
import { progressAPI } from '@/lib/api/progress';
import { PageLoader } from '@/components/loading/page-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Download, 
  Share2, 
  CheckCircle2,
  Mail,
  ExternalLink,
  Copy
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CourseCertificatePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const t = useTranslations('courses.certificate');
  const { id } = use(params);
  const courseId = parseInt(id);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => progressAPI.getCourseProgress(courseId),
    enabled: !!courseId,
  });

  const { data: certificate, isLoading: certLoading } = useQuery({
    queryKey: ['certificate', courseId, certificateId],
    queryFn: () => {
      if (!certificateId) return null;
      return certificatesAPI.verify(certificateId);
    },
    enabled: !!certificateId,
  });

  const generateMutation = useMutation({
    mutationFn: () => certificatesAPI.generate(courseId),
    onSuccess: (data) => {
      setCertificateId(data.certificateId);
      toast.success(t('generated', { defaultValue: 'Certificate generated successfully!' }));
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: () => {
      if (!certificateId) throw new Error('No certificate ID');
      return certificatesAPI.sendEmail(certificateId);
    },
    onSuccess: () => {
      toast.success(t('emailSent', { defaultValue: 'Certificate sent to your email!' }));
    },
  });

  if (courseLoading || progressLoading) {
    return <PageLoader message={t('loading', { defaultValue: 'Loading certificate...' })} />;
  }

  if (!course || !progress) {
    return (
      <div className="container mx-auto py-8">
        <p>{t('notFound', { defaultValue: 'Course or progress not found' })}</p>
      </div>
    );
  }

  const isCompleted = progress.progressPercentage >= 100;
  const hasCertificate = certificateId !== null;

  const handleDownload = () => {
    if (certificateId) {
      const downloadUrl = certificatesAPI.download(certificateId);
      window.open(downloadUrl, '_blank');
    }
  };

  const handleShare = () => {
    if (certificateId) {
      const verificationUrl = `${window.location.origin}/verify/certificate/${certificateId}`;
      navigator.clipboard.writeText(verificationUrl);
      toast.success(t('linkCopied', { defaultValue: 'Verification link copied to clipboard!' }));
    }
  };

  const handleCopyVerificationLink = () => {
    if (certificateId) {
      const verificationUrl = `${window.location.origin}/verify/certificate/${certificateId}`;
      navigator.clipboard.writeText(verificationUrl);
      toast.success(t('linkCopied', { defaultValue: 'Verification link copied to clipboard!' }));
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground mt-2">
          {t('certificate', { defaultValue: 'Course Certificate' })}
        </p>
      </div>

      {/* Completion Status */}
      {!isCompleted && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-500 p-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {t('notCompleted', { defaultValue: 'Course Not Completed' })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('completeToGetCert', { 
                    defaultValue: 'You need to complete 100% of the course to receive a certificate.',
                    progress: progress.progressPercentage.toFixed(0)
                  })}
                </p>
              </div>
              <Badge variant="outline">
                {progress.progressPercentage.toFixed(0)}% {t('complete', { defaultValue: 'Complete' })}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Generation */}
      {isCompleted && !hasCertificate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {t('generateCertificate', { defaultValue: 'Generate Certificate' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('generateDesc', { 
                defaultValue: 'Congratulations! You have completed this course. Generate your certificate to download and share your achievement.'
              })}
            </p>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              size="lg"
            >
              <Award className="h-4 w-4 mr-2" />
              {generateMutation.isPending 
                ? t('generating', { defaultValue: 'Generating...' })
                : t('generate', { defaultValue: 'Generate Certificate' })
              }
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Certificate Display */}
      {isCompleted && hasCertificate && certificate && (
        <>
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  {t('certificateReady', { defaultValue: 'Certificate Ready' })}
                </CardTitle>
                <Badge variant="success">
                  {t('verified', { defaultValue: 'Verified' })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Certificate Preview */}
              <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="mb-4">
                  <Award className="h-16 w-16 mx-auto text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {t('certificateOfCompletion', { defaultValue: 'Certificate of Completion' })}
                </h2>
                <p className="text-lg mb-4">
                  {t('awardedTo', { defaultValue: 'This is to certify that' })}
                </p>
                <p className="text-xl font-semibold mb-2">
                  {certificate.user?.firstName} {certificate.user?.lastName}
                </p>
                <p className="text-muted-foreground mb-4">
                  {t('hasCompleted', { defaultValue: 'has successfully completed the course' })}
                </p>
                <p className="text-lg font-semibold">
                  {course.title}
                </p>
                {certificate.enrollment?.completedAt && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {format(new Date(certificate.enrollment.completedAt), 'MMMM dd, yyyy')}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <Button onClick={handleDownload} size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  {t('downloadPDF', { defaultValue: 'Download PDF' })}
                </Button>
                <Button 
                  onClick={() => sendEmailMutation.mutate()} 
                  variant="outline"
                  size="lg"
                  disabled={sendEmailMutation.isPending}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {sendEmailMutation.isPending 
                    ? t('sending', { defaultValue: 'Sending...' })
                    : t('sendEmail', { defaultValue: 'Send via Email' })
                  }
                </Button>
                <Button 
                  onClick={handleShare} 
                  variant="outline"
                  size="lg"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('share', { defaultValue: 'Share' })}
                </Button>
              </div>

              {/* Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {t('verification', { defaultValue: 'Certificate Verification' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      {certificateId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyVerificationLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const verificationUrl = `${window.location.origin}/verify/certificate/${certificateId}`;
                        window.open(verificationUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('verificationDesc', { 
                      defaultValue: 'Share this verification link to allow others to verify your certificate.'
                    })}
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
