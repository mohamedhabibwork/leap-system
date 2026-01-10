'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MessageCircle, Search, Flame } from 'lucide-react';
import Link from 'next/link';

interface DashboardHeaderProps {
  userName: string;
  learningStreak: number;
}

export function DashboardHeader({ userName, learningStreak }: DashboardHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground mt-2">
            Continue your learning journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          {learningStreak > 0 && (
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Flame className="h-4 w-4 mr-2 text-orange-500" />
              {learningStreak} day streak!
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Link href="/hub/courses">
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Browse Courses
          </Button>
        </Link>
        <Link href="/hub/courses/my-courses">
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            My Courses
          </Button>
        </Link>
        <Link href="/hub/chat">
          <Button variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Messages
          </Button>
        </Link>
      </div>
    </div>
  );
}
