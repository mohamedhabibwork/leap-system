'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useActivePlans } from '@/lib/hooks/use-plans';
import { SubscriptionPayment } from '@/components/payments/subscription-payment';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import type { Plan } from '@/lib/api/plans';

interface SubscriptionPageClientProps {
  locale: string;
  selectedPlanId?: string;
}

export function SubscriptionPageClient({
  locale,
  selectedPlanId,
}: SubscriptionPageClientProps) {
  const t = useTranslations('subscription');
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: plans, isLoading, error } = useActivePlans();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/subscription');
    }
  }, [status, router]);

  // Scroll to selected plan if planId is provided
  useEffect(() => {
    if (selectedPlanId && plans) {
      const planElement = document.getElementById(`plan-${selectedPlanId}`);
      if (planElement) {
        planElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedPlanId, plans]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading plans...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load plans</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const sortedPlans = [...(plans || [])].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleSubscriptionSuccess = () => {
    toast.success(t('subscriptionSuccess', { defaultValue: 'Subscription successful!' }));
    router.push('/hub/dashboard');
  };

  const getPlanName = (plan: Plan) => {
    return locale === 'ar' && plan.nameAr ? plan.nameAr : plan.nameEn;
  };

  const getPlanDescription = (plan: Plan) => {
    return locale === 'ar' && plan.descriptionAr ? plan.descriptionAr : plan.descriptionEn;
  };

  const getPrice = (plan: Plan) => {
    // Use monthly price for now
    return plan.priceMonthly?.toString() || '0';
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('title', { defaultValue: 'Choose Your Plan' })}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle', {
              defaultValue: 'Select a subscription plan that fits your learning needs',
            })}
          </p>
        </div>

        {/* Plans Grid */}
        {sortedPlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('noPlans', { defaultValue: 'No plans available at the moment' })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {sortedPlans.map((plan, index) => {
              const isHighlighted = index === Math.floor(sortedPlans.length / 2);
              const planName = getPlanName(plan);
              const planDescription = getPlanDescription(plan);
              const price = getPrice(plan);

              return (
                <div
                  key={plan.id}
                  id={`plan-${plan.id}`}
                  className={`relative rounded-2xl transition-all duration-500 ${
                    isHighlighted
                      ? 'bg-foreground text-background shadow-xl scale-105 border-2 border-foreground'
                      : 'bg-card text-card-foreground border border-border hover:shadow-lg'
                  } ${selectedPlanId === plan.id.toString() ? 'ring-4 ring-blue-500' : ''}`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      {t('mostPopular', { defaultValue: 'Most Popular' })}
                    </div>
                  )}

                  <div className="p-8 space-y-6">
                    {/* Plan Name */}
                    <h3 className="text-2xl font-semibold">{planName}</h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">${price}</span>
                      <span
                        className={isHighlighted ? 'opacity-70' : 'text-muted-foreground'}
                      >
                        {t('monthLabel', { defaultValue: '/month' })}
                      </span>
                    </div>

                    {/* Description */}
                    {planDescription && (
                      <p className={isHighlighted ? 'opacity-80' : 'text-muted-foreground'}>
                        {planDescription}
                      </p>
                    )}

                    <div className="border-t border-current opacity-10"></div>

                    {/* Max Courses Info */}
                    {plan.maxCourses && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check
                          className={`h-5 w-5 flex-shrink-0 ${
                            isHighlighted ? 'opacity-80' : 'text-blue-600 dark:text-blue-400'
                          }`}
                        />
                        <span>
                          {plan.maxCourses === -1
                            ? t('unlimitedCourses', { defaultValue: 'Unlimited courses' })
                            : t('maxCourses', {
                                defaultValue: 'Up to {count} courses',
                                count: plan.maxCourses,
                              })}
                        </span>
                      </div>
                    )}

                    {/* Subscription Payment Component */}
                    <div className="pt-4">
                      <SubscriptionPayment
                        planId={plan.id.toString()}
                        planName={planName}
                        planPrice={price}
                        onSuccess={handleSubscriptionSuccess}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-16 text-center text-muted-foreground text-sm space-y-2">
          <p>
            {t('additionalInfo', {
              defaultValue: 'All plans include a 14-day money-back guarantee',
            })}
          </p>
          <p>
            {t('needHelp', { defaultValue: 'Need help choosing?' })}{' '}
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold underline underline-offset-4"
            >
              {t('contactUs', { defaultValue: 'Contact us' })}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
