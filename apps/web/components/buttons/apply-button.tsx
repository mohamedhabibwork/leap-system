'use client';

import { Button } from '@/components/ui/button';
import { Send, CheckCircle, Upload } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApplyForJob } from '@/lib/hooks/use-api';
import { mediaAPI } from '@/lib/api/media';

interface ApplyButtonProps {
  jobId: number;
  hasApplied?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

/**
 * ApplyButton Component
 * Allows users to apply for jobs with file upload
 * 
 * RTL/LTR Support:
 * - Form labels and inputs align to text direction
 * - Buttons positioned with gap for proper spacing
 * - Grid layout adapts to reading direction
 * 
 * Theme Support:
 * - Uses theme-aware form controls
 * - Dialog background and text colors adapt to theme
 * - Focus states visible in both themes
 */
export function ApplyButton({ jobId, hasApplied, size = 'default' }: ApplyButtonProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    resumeUrl: '',
    coverLetter: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const applyMutation = useApplyForJob();

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      // Use unified mediaAPI for upload
      const response = await mediaAPI.upload(file, 'resumes');

      setFormData(prev => ({ ...prev, resumeUrl: response.url }));
      return response.url;
    } catch (error) {
      console.error('Failed to upload resume:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || !formData.coverLetter) {
      return;
    }

    // Upload resume if needed
    let resumeUrl = formData.resumeUrl;
    if (resumeFile && !resumeUrl) {
      try {
        resumeUrl = await handleFileUpload(resumeFile);
      } catch (error) {
        return;
      }
    }

    if (!resumeUrl) {
      return;
    }

    try {
      await applyMutation.mutateAsync({
        id: jobId,
        data: {
          ...formData,
          resumeUrl,
        },
      });
      setOpen(false);
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        resumeUrl: '',
        coverLetter: '',
      });
      setResumeFile(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (hasApplied) {
    return (
      <Button size={size} variant="secondary" disabled className="gap-2">
        <CheckCircle className="h-4 w-4" />
        Applied
      </Button>
    );
  }

  return (
    <>
      <Button
        size={size}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="gap-2"
      >
        <Send className="h-4 w-4" />
        Apply Now
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-start">Apply for this position</DialogTitle>
            <DialogDescription className="text-start">
              Fill in your details to submit your application.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-start block">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  placeholder="John Doe"
                  className="text-start"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-start block">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="john@example.com"
                  className="text-start"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-start block">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+1 (555) 000-0000"
                className="text-start"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume" className="text-start block">
                Resume/CV *
              </Label>
              <div className="relative">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Check file size (5MB max)
                      if (file.size > 5 * 1024 * 1024) {
                        e.target.value = '';
                        return;
                      }
                      setResumeFile(file);
                    }
                  }}
                  required={!formData.resumeUrl}
                  disabled={uploading}
                  className="text-start"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <Upload className="h-4 w-4 animate-pulse" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-start">
                Accepted formats: PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="text-start block">
                Cover Letter *
              </Label>
              <Textarea
                id="coverLetter"
                value={formData.coverLetter}
                onChange={(e) =>
                  setFormData({ ...formData, coverLetter: e.target.value })
                }
                rows={6}
                placeholder="Tell us why you're a great fit for this position..."
                required
                className="text-start resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={applyMutation.isPending || uploading}
                className="gap-2"
              >
                {applyMutation.isPending || uploading ? (
                  <>
                    <Upload className="h-4 w-4 animate-pulse" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
