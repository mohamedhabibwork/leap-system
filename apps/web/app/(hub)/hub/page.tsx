'use client';

import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Calendar, Briefcase, MessageCircle } from 'lucide-react';

export default function HubPage() {
  const router = useRouter();

  const modules = [
    {
      id: 'courses',
      name: 'Learning (LMS)',
      description: 'Browse courses, enroll, and track your learning progress',
      icon: BookOpen,
      href: '/hub/courses',
      color: 'text-blue-500',
    },
    {
      id: 'social',
      name: 'Social Network',
      description: 'Connect with others, share posts, join groups and pages',
      icon: Users,
      href: '/hub/social',
      color: 'text-green-500',
    },
    {
      id: 'events',
      name: 'Events',
      description: 'Discover and register for upcoming events and activities',
      icon: Calendar,
      href: '/hub/events',
      color: 'text-orange-500',
    },
    {
      id: 'jobs',
      name: 'Job Board',
      description: 'Find opportunities and apply for jobs in your field',
      icon: Briefcase,
      href: '/hub/jobs',
      color: 'text-purple-500',
    },
    {
      id: 'chat',
      name: 'Messaging',
      description: 'Chat with your connections in real-time',
      icon: MessageCircle,
      href: '/hub/chat',
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to LEAP PM Hub</h1>
        <p className="text-muted-foreground mt-2">
          Your central place for learning, networking, and career growth
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(module.href)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${module.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{module.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{module.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
