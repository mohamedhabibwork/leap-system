import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Briefcase, Heart, TrendingUp, Users, Zap, Globe } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Careers | LEAP PM',
  description: 'Join the LEAP PM team and help shape the future of education.',
};

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const benefits = [
    {
      icon: Heart,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance, dental, vision, and mental health support',
    },
    {
      icon: TrendingUp,
      title: 'Growth & Learning',
      description: 'Unlimited access to courses, conferences, and professional development',
    },
    {
      icon: Users,
      title: 'Work-Life Balance',
      description: 'Flexible hours, remote work options, and generous PTO',
    },
    {
      icon: Zap,
      title: 'Competitive Compensation',
      description: 'Market-leading salaries, equity options, and performance bonuses',
    },
    {
      icon: Globe,
      title: 'Remote-First Culture',
      description: 'Work from anywhere with a distributed team across the globe',
    },
    {
      icon: Briefcase,
      title: 'Career Advancement',
      description: 'Clear career paths and opportunities for leadership roles',
    },
  ];

  const openPositions = [
    {
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'San Francisco, CA',
      type: 'Full-time',
    },
    {
      title: 'Content Marketing Manager',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'New York, NY',
      type: 'Full-time',
    },
    {
      title: 'Data Scientist',
      department: 'Data & Analytics',
      location: 'Remote',
      type: 'Full-time',
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
              Build the Future of
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Education with Us
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Join our mission to make quality education accessible to everyone. We're looking for passionate individuals who want to make a real impact.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Join LEAP PM?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We offer more than just a job—we offer a chance to grow your career while making a difference
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300"
                >
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-border/50 mb-4">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-muted-foreground">
              Find your next opportunity and apply today
            </p>
          </div>

          <div className="space-y-4">
            {openPositions.map((position) => (
              <div
                key={position.title}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>{position.department}</span>
                      <span>•</span>
                      <span>{position.location}</span>
                      <span>•</span>
                      <span>{position.type}</span>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/contact?subject=${encodeURIComponent(position.title)}`}>
                      Apply Now
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Don't see a position that fits? We're always looking for talented people.
            </p>
            <Button asChild>
              <Link href="/contact?subject=General Application">
                Send Us Your Resume
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Diversity & Inclusion */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Diversity & Inclusion
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            At LEAP PM, we believe that diverse perspectives make us stronger. We're committed to building an inclusive workplace where everyone feels valued, respected, and empowered to do their best work. We're an equal opportunity employer and welcome applications from all qualified candidates.
          </p>
        </div>
      </section>
    </>
  );
}
