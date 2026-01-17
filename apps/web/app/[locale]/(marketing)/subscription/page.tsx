import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SubscriptionPageClient } from './subscription-page-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'subscription' });

  return {
    title: t('title', { defaultValue: 'Choose Your Plan' }),
    description: t('description', { defaultValue: 'Select a subscription plan that fits your needs' }),
  };
}

export default async function SubscriptionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ planId?: string }>;
}) {
  const { locale } = await params;
  const { planId } = await searchParams;

  return <SubscriptionPageClient locale={locale} selectedPlanId={planId} />;
}
