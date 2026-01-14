'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Flame, Target, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { LikeButton } from '@/components/buttons/like-button';
import { ShareButton } from '@/components/buttons/share-button';

interface LearningMilestoneCardProps {
  userId: number;
  userName: string;
  userAvatar?: string;
  milestoneType: 'lesson' | 'module' | 'streak' | 'hours';
  milestoneTitle: string;
  milestoneValue: number;
  milestoneUnit: string;
  courseId?: string;
  courseName?: string;
  achievedAt: string;
  likeCount?: number;
  isLiked?: boolean;
  shareCount?: number;
}

export function LearningMilestoneCard({
  userId,
  userName,
  userAvatar,
  milestoneType,
  milestoneTitle,
  milestoneValue,
  milestoneUnit,
  courseId,
  courseName,
  achievedAt,
  likeCount = 0,
  isLiked = false,
  shareCount = 0,
}: LearningMilestoneCardProps) {
  const t = useTranslations('learning.feed');

  const getMilestoneIcon = () => {
    switch (milestoneType) {
      case 'lesson':
        return <CheckCircle2 className="h-12 w-12 text-green-500" />;
      case 'module':
        return <Target className="h-12 w-12 text-blue-500" />;
      case 'streak':
        return <Flame className="h-12 w-12 text-orange-500" />;
      case 'hours':
        return <TrendingUp className="h-12 w-12 text-purple-500" />;
      default:
        return <CheckCircle2 className="h-12 w-12 text-green-500" />;
    }
  };

  const getMilestoneColor = () => {
    switch (milestoneType) {
      case 'lesson':
        return 'from-green-500/20 to-emerald-500/20';
      case 'module':
        return 'from-blue-500/20 to-cyan-500/20';
      case 'streak':
        return 'from-orange-500/20 to-red-500/20';
      case 'hours':
        return 'from-purple-500/20 to-pink-500/20';
      default:
        return 'from-green-500/20 to-emerald-500/20';
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Link href={`/hub/users/${userId}`}>
            <Avatar className="hover:ring-2 hover:ring-primary transition-all">
              <AvatarImage src={userAvatar} />
              <AvatarFallback>{userName[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link
              href={`/hub/users/${userId}`}
              className="font-semibold hover:underline inline-flex items-center gap-1.5"
            >
              {userName}
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <TrendingUp className="h-4 w-4" />
              <span>{t('reachedMilestone')}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(achievedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className={`relative p-6 rounded-lg bg-gradient-to-br ${getMilestoneColor()} border-2 border-primary/20`}>
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              {getMilestoneIcon()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold">{milestoneTitle}</h3>
              <p className="text-3xl font-bold text-primary mt-2">
                {milestoneValue} {milestoneUnit}
              </p>

              {courseId && courseName && (
                <Link 
                  href={`/hub/courses/${courseId}`}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline mt-2 inline-block"
                >
                  {t('in')} <span className="font-medium">{courseName}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Progress indicator (optional) */}
          {milestoneType === 'streak' && (
            <div className="mt-4 pt-4 border-t border-primary/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('keepGoing')}</span>
                <Badge variant="secondary">
                  🔥 {milestoneValue} {t('daysStreak')}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-1">
          <LikeButton
            entityType="milestone"
            entityId={`${userId}-${milestoneType}`}
            isLiked={isLiked}
            likeCount={likeCount}
          />
        </div>
        <ShareButton
          entityType="milestone"
          entityId={`${userId}-${milestoneType}`}
          url={`/hub/users/${userId}`}
          title={milestoneTitle}
          shareCount={shareCount}
        />
      </CardFooter>
    </Card>
  );
}
