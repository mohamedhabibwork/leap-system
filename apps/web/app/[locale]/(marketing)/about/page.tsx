import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Heart, Users, Zap, Target, Award, Globe } from 'lucide-react';
import { TeamMemberCard } from '@/components/marketing/team-member-card';
import { ValuesGrid } from '@/components/marketing/values-grid';
import { MilestoneTimeline } from '@/components/marketing/milestone-timeline';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Us | LEAP PM',
  description: 'Learn about LEAP PM, our mission, team, and journey to revolutionize online learning.',
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const values = [
    {
      icon: Heart,
      title: 'Student-Centered',
      description: 'Every decision we make puts learners first. We believe education should be accessible, engaging, and transformative.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We constantly push boundaries with cutting-edge technology to deliver the best learning experience.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Learning is better together. We foster connections between students, instructors, and industry professionals.',
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'We maintain the highest standards in course quality, platform reliability, and customer support.',
    },
    {
      icon: Award,
      title: 'Integrity',
      description: 'We operate with transparency, honesty, and accountability in everything we do.',
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Education should be available to everyone, everywhere. We break down barriers to learning.',
    },
  ];

  const milestones = [
    {
      year: '2020',
      title: 'The Beginning',
      description: 'LEAP PM was founded with a vision to democratize education and make quality learning accessible to everyone.',
    },
    {
      year: '2021',
      title: 'First 1,000 Students',
      description: 'Reached our first milestone of 1,000 active students and launched our mobile app.',
    },
    {
      year: '2022',
      title: 'Platform Expansion',
      description: 'Added live sessions, social learning features, and expanded to 50+ countries.',
    },
    {
      year: '2023',
      title: 'AI Integration',
      description: 'Integrated AI-powered personalized learning paths and advanced analytics.',
    },
    {
      year: '2024',
      title: '50,000+ Learners',
      description: 'Surpassed 50,000 active learners and 1,000 courses across all categories.',
    },
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former EdTech executive with 15+ years of experience in online education.',
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      bio: 'Tech innovator passionate about building scalable learning platforms.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      bio: 'Product leader focused on creating delightful user experiences.',
    },
    {
      name: 'David Park',
      role: 'Head of Engineering',
      bio: 'Engineering expert with a track record of building high-performance systems.',
    },
    {
      name: 'Jessica Martinez',
      role: 'Head of Content',
      bio: 'Curriculum developer ensuring the highest quality learning materials.',
    },
    {
      name: 'Ryan Thompson',
      role: 'Head of Marketing',
      bio: 'Growth specialist helping learners discover their potential.',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
              Empowering Learners
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Around the World
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              At LEAP PM, we're on a mission to make quality education accessible to everyone. 
              We believe learning should be engaging, effective, and available anytime, anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do
            </p>
          </div>
          <ValuesGrid values={values} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">50K+</div>
              <div className="text-muted-foreground">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">1K+</div>
              <div className="text-muted-foreground">Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">500+</div>
              <div className="text-muted-foreground">Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">50+</div>
              <div className="text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-muted-foreground">
              From a simple idea to a thriving learning community
            </p>
          </div>
          <MilestoneTimeline milestones={milestones} />
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Passionate professionals dedicated to transforming education
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {team.map((member, index) => (
              <TeamMemberCard key={member.name} {...member} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Join Us on This Journey
          </h2>
          <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
            Whether you're a learner, instructor, or partner, there's a place for you at LEAP PM.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Start Learning
              </Button>
            </Link>
            <Link href="/become-instructor">
              <Button size="lg" variant="outline" className="min-w-[200px] border-current hover:bg-background/10">
                Become an Instructor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
