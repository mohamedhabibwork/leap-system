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
import { Loader2, CheckCircle } from 'lucide-react';

const instructorApplicationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  expertise: z.string().min(10, 'Please describe your area of expertise'),
  experience: z.string().min(50, 'Please describe your teaching experience'),
  courseIdeas: z.string().min(100, 'Please describe your course ideas'),
  socialMedia: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  whyTeach: z.string().min(100, 'Please tell us why you want to teach'),
});

type InstructorApplicationFormData = z.infer<typeof instructorApplicationSchema>;

export function InstructorApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<InstructorApplicationFormData>({
    resolver: zodResolver(instructorApplicationSchema),
    mode: 'onBlur',
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof InstructorApplicationFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['fullName', 'email', 'phone'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['expertise', 'experience'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: InstructorApplicationFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Instructor application:', data);
      
      toast.success('Application submitted successfully!');
      setIsSubmitted(true);
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Application Submitted!
        </h3>
        <p className="text-muted-foreground mb-4">
          Thank you for applying to become an instructor. We'll review your application and get back to you within 2-3 business days.
        </p>
        <p className="text-sm text-muted-foreground">
          You'll receive a confirmation email shortly.
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

      {/* Step 2: Expertise & Experience */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Your Expertise
          </h3>

          <div className="space-y-2">
            <Label htmlFor="expertise">Area of Expertise *</Label>
            <Input
              id="expertise"
              placeholder="e.g., Web Development, Data Science, Marketing"
              {...register('expertise')}
              className={errors.expertise ? 'border-destructive' : ''}
            />
            {errors.expertise && (
              <p className="text-sm text-destructive">{errors.expertise.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Teaching Experience *</Label>
            <Textarea
              id="experience"
              placeholder="Tell us about your teaching experience (online or offline)..."
              rows={5}
              {...register('experience')}
              className={errors.experience ? 'border-destructive' : ''}
            />
            {errors.experience && (
              <p className="text-sm text-destructive">{errors.experience.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialMedia">Social Media / YouTube (Optional)</Label>
            <Input
              id="socialMedia"
              placeholder="Your social media handles or YouTube channel"
              {...register('socialMedia')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Personal Website (Optional)</Label>
            <Input
              id="website"
              placeholder="https://yourwebsite.com"
              {...register('website')}
              className={errors.website ? 'border-destructive' : ''}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Course Ideas & Motivation */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Your Teaching Plans
          </h3>

          <div className="space-y-2">
            <Label htmlFor="courseIdeas">Course Ideas *</Label>
            <Textarea
              id="courseIdeas"
              placeholder="Describe the courses you'd like to create on our platform..."
              rows={6}
              {...register('courseIdeas')}
              className={errors.courseIdeas ? 'border-destructive' : ''}
            />
            {errors.courseIdeas && (
              <p className="text-sm text-destructive">{errors.courseIdeas.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whyTeach">Why Do You Want to Teach on LEAP PM? *</Label>
            <Textarea
              id="whyTeach"
              placeholder="Share your motivation for becoming an instructor..."
              rows={6}
              {...register('whyTeach')}
              className={errors.whyTeach ? 'border-destructive' : ''}
            />
            {errors.whyTeach && (
              <p className="text-sm text-destructive">{errors.whyTeach.message}</p>
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
