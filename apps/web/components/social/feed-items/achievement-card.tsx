'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Trophy, Medal, Star, Zap, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { LikeButton } from '@/components/buttons/like-button';
import { ShareButton } from '@/components/buttons/share-button';

interface AchievementCardProps {
  userId: number;
  userName: string;
  userAvatar?: string;
  achievementType: 'certificate' | 'badge' | 'milestone' | 'streak';
  achievementTitle: string;
  achievementDescription: string;
  achievementIcon?: string;
  relatedCourseId?: string;
  relatedCourseName?: string;
  earnedAt: string;
  likeCount?: number;
  isLiked?: boolean;
  shareCount?: number;
}

export function AchievementCard({
  userId,
  userName,
  userAvatar,
  achievementType,
  achievementTitle,
  achievementDescription,
  achievementIcon,
  relatedCourseId,
  relatedCourseName,
  earnedAt,
  likeCount = 0,
  isLiked = false,
  shareCount = 0,
}: AchievementCardProps) {
  const t = useTranslations('learning.feed');

  const getAchievementIcon = () => {
    switch (achievementType) {
      case 'certificate':
        return <Award className="h-16 w-16 text-amber-500" />;
      case 'badge':
        return <Medal className="h-16 w-16 text-blue-500" />;
      case 'milestone':
        return <Target className="h-16 w-16 text-green-500" />;
      case 'streak':
        return <Zap className="h-16 w-16 text-orange-500" />;
      default:
        return <Trophy className="h-16 w-16 text-purple-500" />;
    }
  };

  const getAchievementColor = () => {
    switch (achievementType) {
      case 'certificate':
        return 'from-amber-500/20 to-yellow-500/20';
      case 'badge':
        return 'from-blue-500/20 to-cyan-500/20';
      case 'milestone':
        return 'from-green-500/20 to-emerald-500/20';
      case 'streak':
        return 'from-orange-500/20 to-red-500/20';
      default:
        return 'from-purple-500/20 to-pink-500/20';
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
              <Trophy className="h-4 w-4" />
              <span>{t('earnedAchievement')}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(earnedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Achievement Display */}
        <div className={`relative p-8 rounded-lg bg-gradient-to-br ${getAchievementColor()} border-2 border-primary/20`}>
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div className="relative">
              {getAchievementIcon()}
              <div className="absolute -top-2 -right-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500 animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold">{achievementTitle}</h3>
              <p className="text-muted-foreground mt-2">{achievementDescription}</p>
            </div>

            {/* Related Course */}
            {relatedCourseId && relatedCourseName && (
              <Badge variant="secondary" className="mt-4">
                {relatedCourseName}
              </Badge>
            )}
          </div>

          {/* Confetti Effect (optional) */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 text-yellow-500 opacity-50 animate-bounce">✨</div>
            <div className="absolute top-8 right-8 text-yellow-500 opacity-50 animate-bounce delay-100">⭐</div>
            <div className="absolute bottom-8 left-8 text-yellow-500 opacity-50 animate-bounce delay-200">🎉</div>
            <div className="absolute bottom-4 right-4 text-yellow-500 opacity-50 animate-bounce delay-300">🌟</div>
          </div>
        </div>

        {/* View Certificate/Badge Button */}
        {achievementType === 'certificate' && relatedCourseId && (
          <div className="mt-4 flex justify-center">
            <Button asChild>
              <Link href={`/hub/courses/${relatedCourseId}/certificate`}>
                {t('viewCertificate')}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-1">
          <LikeButton
            entityType="achievement"
            entityId={`${userId}-${achievementType}`}
            isLiked={isLiked}
            likeCount={likeCount}
          />
        </div>
        <ShareButton
          entityType="achievement"
          entityId={`${userId}-${achievementType}`}
          url={`/hub/users/${userId}/achievements`}
          title={achievementTitle}
          shareCount={shareCount}
        />
      </CardFooter>
    </Card>
  );
}
