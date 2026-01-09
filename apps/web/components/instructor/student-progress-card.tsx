'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { StudentProgress } from '@leap-lms/shared-types';

interface StudentProgressCardProps {
  student: StudentProgress;
  onClick?: () => void;
}

export function StudentProgressCard({ student, onClick }: StudentProgressCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const progressValue = parseFloat(student.progressPercentage.toString());

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Student Info */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(student.userName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{student.userName}</p>
            <p className="text-sm text-muted-foreground truncate">{student.userEmail}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{progressValue.toFixed(0)}%</span>
          </div>
          <Progress value={progressValue} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Completed Lessons</p>
            <p className="font-semibold">
              {student.completedLessons} / {student.totalLessons}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Activity</p>
            <p className="font-semibold">
              {student.lastAccessedAt
                ? formatDistanceToNow(new Date(student.lastAccessedAt), { addSuffix: true })
                : 'Never'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
