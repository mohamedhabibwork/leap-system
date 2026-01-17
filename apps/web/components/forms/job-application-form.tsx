'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Upload, CheckCircle } from 'lucide-react';
import { jobsAPI } from '@/lib/api/jobs';
import { mediaAPI } from '@/lib/api/media';

const jobApplicationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  linkedIn: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid URL').optional().or(z.literal('')),
  coverLetter: z.string().min(100, 'Cover letter must be at least 100 characters'),
  experience: z.string().min(50, 'Please describe your relevant experience'),
});

type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

interface JobApplicationFormProps {
  jobId: number;
  jobTitle?: string;
}

export function JobApplicationForm({ jobId, jobTitle }: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<JobApplicationFormData>({
    // @ts-ignore
    resolver: zodResolver(jobApplicationSchema),
    mode: 'onBlur',
  });

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      toast.success('Resume uploaded successfully');
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof JobApplicationFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['fullName', 'email', 'phone'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['linkedIn', 'portfolio'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: JobApplicationFormData) => {
    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload resume
      const uploadRes = await mediaAPI.upload(resumeFile, 'resumes');
      
      // 2. Submit application
      await jobsAPI.apply(jobId, {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        resumeUrl: uploadRes.url,
        coverLetter: data.coverLetter,
        // linkedIn and portfolio could be added to ApplyJobDto or passed in data
        ...data,
      } );
      
      toast.success('Application submitted successfully! We\'ll be in touch soon.');
      setCurrentStep(4); // Show success step
    } catch (error) {
      const message = (error )?.response?.data?.message || 'Failed to submit application. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === 4) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Application Submitted!
        </h3>
        <p className="text-muted-foreground">
          Thank you for applying. We'll review your application and get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                currentStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 transition-colors ${
                  currentStep > step ? 'bg-blue-600' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Basic Information
          </h3>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              {...register('fullName')}
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register('phone')}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Professional Links & Resume */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Professional Links & Resume
          </h3>

          <div className="space-y-2">
            <Label htmlFor="linkedIn">LinkedIn Profile</Label>
            <Input
              id="linkedIn"
              placeholder="https://linkedin.com/in/yourprofile"
              {...register('linkedIn')}
              className={errors.linkedIn ? 'border-destructive' : ''}
            />
            {errors.linkedIn && (
              <p className="text-sm text-destructive">{errors.linkedIn.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio / Website</Label>
            <Input
              id="portfolio"
              placeholder="https://yourportfolio.com"
              {...register('portfolio')}
              className={errors.portfolio ? 'border-destructive' : ''}
            />
            {errors.portfolio && (
              <p className="text-sm text-destructive">{errors.portfolio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume / CV *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="cursor-pointer"
              />
              {resumeFile && (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              PDF, DOC, or DOCX (Max 5MB)
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Cover Letter & Experience */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Tell Us About Yourself
          </h3>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you're interested in this position..."
              rows={6}
              {...register('coverLetter')}
              className={errors.coverLetter ? 'border-destructive' : ''}
            />
            {errors.coverLetter && (
              <p className="text-sm text-destructive">{errors.coverLetter.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Relevant Experience *</Label>
            <Textarea
              id="experience"
              placeholder="Describe your relevant work experience and achievements..."
              rows={6}
              {...register('experience')}
              className={errors.experience ? 'border-destructive' : ''}
            />
            {errors.experience && (
              <p className="text-sm text-destructive">{errors.experience.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-border">
        {currentStep > 1 && (
          <Button type="button" variant="outline" onClick={prevStep}>
            Previous
          </Button>
        )}
        {currentStep < 3 ? (
          <Button type="button" onClick={nextStep} className="ml-auto">
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting} className="ml-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
