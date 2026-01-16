import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificatesAPI, CertificateVerification } from '@/lib/api/certificates';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

/**
 * Hook to verify a certificate
 */
export function useCertificate(certificateId: string | null, enabled = true) {
  return useQuery<CertificateVerification | null>({
    queryKey: ['certificate', certificateId],
    queryFn: () => {
      if (!certificateId) return null;
      return certificatesAPI.verify(certificateId);
    },
    enabled: !!certificateId && enabled,
  });
}

/**
 * Hook to get certificate download URL for a course
 * This tries to get the certificate ID first, then fetches the download URL
 */
export function useCourseCertificate(courseId: number, enabled = true) {
  return useQuery<{ url: string | null; certificateId?: string; issuedAt?: Date } | null>({
    queryKey: ['course-certificate', courseId],
    queryFn: async () => {
      try {
        // Try to get certificate info by courseId
        // The API might return certificateId or the full certificate data
        const response = await apiClient.get<{ certificateId?: string; url?: string | null; issuedAt?: Date }>(
          `/lms/certificates/course/${courseId}`
        );
        
        // If we have a certificateId, get the download URL
        if (response?.certificateId) {
          const downloadUrlResponse = await certificatesAPI.getDownloadUrl(response.certificateId);
          return {
            ...downloadUrlResponse,
            certificateId: response.certificateId,
            issuedAt: response.issuedAt,
          };
        }
        
        // If response has url directly, return it
        if (response?.url !== undefined) {
          return {
            url: response.url,
            certificateId: response.certificateId,
            issuedAt: response.issuedAt,
          };
        }
        
        return null;
      } catch {
        // If endpoint doesn't exist, try the old method
        try {
          return await certificatesAPI.getDownloadUrl(courseId.toString());
        } catch {
          return null;
        }
      }
    },
    enabled: !!courseId && enabled,
  });
}

/**
 * Hook to generate a certificate for a course
 */
export function useGenerateCertificate(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation<
    { filePath: string; downloadUrl: string; certificateId: string },
    Error,
    void
  >({
    mutationFn: () => certificatesAPI.generate(courseId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course-certificate', courseId] });
      queryClient.invalidateQueries({ queryKey: ['certificate', data.certificateId] });
      toast.success('Certificate generated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate certificate');
    },
  });
}

/**
 * Hook to send certificate via email
 */
export function useSendCertificateEmail() {
  return useMutation<void, Error, string>({
    mutationFn: (certificateId: string) => {
      if (!certificateId) throw new Error('No certificate ID');
      return certificatesAPI.sendEmail(certificateId);
    },
    onSuccess: () => {
      toast.success('Certificate sent to your email!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send certificate email');
    },
  });
}
