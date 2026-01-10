import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { BookOpen, Video, Users, Settings, CreditCard, Shield, Zap, HelpCircle } from 'lucide-react';
import { HelpCategoryCard } from '@/components/support/help-category-card';
import { HelpSearch } from '@/components/support/help-search';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Help Center | LEAP PM',
  description: 'Find answers to your questions and get help with LEAP PM.',
};

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const categories = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using LEAP PM and set up your account',
      icon: BookOpen,
      href: '/help/getting-started',
      articleCount: 12,
    },
    {
      title: 'Courses & Learning',
      description: 'Everything about enrolling, accessing, and completing courses',
      icon: Video,
      href: '/help/courses',
      articleCount: 18,
    },
    {
      title: 'Account Management',
      description: 'Manage your profile, settings, and preferences',
      icon: Users,
      href: '/help/account',
      articleCount: 15,
    },
    {
      title: 'Technical Support',
      description: 'Troubleshoot technical issues and optimize your experience',
      icon: Settings,
      href: '/help/technical',
      articleCount: 20,
    },
    {
      title: 'Billing & Payments',
      description: 'Information about pricing, payments, and refunds',
      icon: CreditCard,
      href: '/help/billing',
      articleCount: 10,
    },
    {
      title: 'Privacy & Security',
      description: 'Learn about how we protect your data and privacy',
      icon: Shield,
      href: '/help/privacy',
      articleCount: 8,
    },
    {
      title: 'Instructor Resources',
      description: 'Guides for creating and managing courses as an instructor',
      icon: Zap,
      href: '/help/instructor',
      articleCount: 25,
    },
    {
      title: 'Troubleshooting',
      description: 'Common problems and their solutions',
      icon: HelpCircle,
      href: '/help/troubleshooting',
      articleCount: 14,
    },
  ];

  const popularArticles = [
    { title: 'How to enroll in a course', category: 'Courses & Learning' },
    { title: 'Resetting your password', category: 'Account Management' },
    { title: 'Understanding our refund policy', category: 'Billing & Payments' },
    { title: 'Video playback issues', category: 'Technical Support' },
    { title: 'Creating your first course', category: 'Instructor Resources' },
    { title: 'Enabling two-factor authentication', category: 'Privacy & Security' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              How Can We Help You?
            </h1>
            <p className="text-lg text-muted-foreground">
              Search our knowledge base or browse categories below
            </p>
          </div>
          <HelpSearch />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <HelpCategoryCard key={category.title} {...category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticles.map((article, index) => (
              <Link
                key={index}
                href="/help"
                className="p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
              >
                <h3 className="font-medium text-foreground mb-1">{article.title}</h3>
                <p className="text-xs text-muted-foreground">{article.category}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Still Need Help?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/faq">View FAQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
