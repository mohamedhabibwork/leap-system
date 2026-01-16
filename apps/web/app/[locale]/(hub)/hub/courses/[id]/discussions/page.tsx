'use client';

import { use, useState } from 'react';
import { useCourse } from '@/lib/hooks/use-api';
import { Thread } from '@/lib/api/discussions';
import {
  useCourseThreads,
  useCreateThread,
  useReplyToThread,
  useUpvoteThread,
} from '@/hooks/use-discussions';
import { PageLoader } from '@/components/loading/page-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  ThumbsUp,
  Reply as ReplyIcon,
  CheckCircle2,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CourseDiscussionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('courses.discussions');
  const router = useRouter();
  const { id } = use(params);
  const courseId = parseInt(id);
  const { user } = useAuthStore();

  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLesson, setFilterLesson] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { data: threads, isLoading: isLoadingThreads } = useCourseThreads(courseId, {
    sortBy,
    limit: 50,
  });

  const createThreadMutation = useCreateThread(courseId);
  const replyMutation = useReplyToThread(courseId);
  const upvoteThreadMutation = useUpvoteThread(courseId);

  if (isLoadingCourse || isLoadingThreads) {
    return <PageLoader message={t('loading')} />;
  }

  if (!course) {
    return <div>{t('courseNotFound')}</div>;
  }

  const courseData = course as any;
  const allLessons = (courseData.sections || []).flatMap(
    (section: any) => section.lessons || [],
  );

  const filteredThreads = (threads || []).filter((thread: Thread) => {
    if (filterLesson && thread.lessonId !== filterLesson) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        thread.title.toLowerCase().includes(query) ||
        thread.content.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleCreateThread = () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;
    createThreadMutation.mutate(
      {
        title: newThreadTitle,
        content: newThreadContent,
        lessonId: selectedLesson || undefined,
      },
      {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
          setNewThreadTitle('');
          setNewThreadContent('');
          setSelectedLesson(null);
        },
      }
    );
  };

  const handleReply = (threadId: number) => {
    if (!replyContent.trim()) return;
    replyMutation.mutate(
      { threadId, content: replyContent },
      {
        onSuccess: () => {
          setReplyingTo(null);
          setReplyContent('');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/hub/courses/${courseId}`)}
            className="mb-4"
          >
            ← {t('backToCourse')}
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{courseData.titleEn}</h1>
              <p className="text-muted-foreground">{t('discussionsSubtitle')}</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createThread')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('createNewThread')}</DialogTitle>
                  <DialogDescription>{t('createThreadDescription')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('threadTitle')}
                    </label>
                    <Input
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      placeholder={t('threadTitlePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('lesson')} ({t('optional')})
                    </label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedLesson || ''}
                      onChange={(e) =>
                        setSelectedLesson(e.target.value ? parseInt(e.target.value) : null)
                      }
                      aria-label={t('lesson')}
                    >
                      <option value="">{t('allLessons')}</option>
                      {allLessons.map((lesson: any) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.titleEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('content')}
                    </label>
                    <Textarea
                      value={newThreadContent}
                      onChange={(e) => setNewThreadContent(e.target.value)}
                      placeholder={t('contentPlaceholder')}
                      rows={6}
                    />
                  </div>
                  <Button
                    onClick={handleCreateThread}
                    disabled={createThreadMutation.isPending}
                    className="w-full"
                  >
                    {createThreadMutation.isPending ? t('creating') : t('create')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchThreads')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterLesson || ''}
                onChange={(e) =>
                  setFilterLesson(e.target.value ? parseInt(e.target.value) : null)
                }
                aria-label={t('filterByLesson')}
              >
                <option value="">{t('allLessons')}</option>
                {allLessons.map((lesson: any) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.titleEn}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'recent' | 'popular' | 'unanswered')
                }
                aria-label={t('sortBy')}
              >
                <option value="recent">{t('sortRecent')}</option>
                <option value="popular">{t('sortPopular')}</option>
                <option value="unanswered">{t('sortUnanswered')}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Threads List */}
        <div className="space-y-4">
          {filteredThreads.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('noThreads')}</p>
            </Card>
          ) : (
            filteredThreads.map((thread: Thread) => (
              <Card key={thread.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={thread.user.avatarUrl} />
                    <AvatarFallback>
                      {thread.user.firstName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{thread.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {thread.user.firstName} {thread.user.lastName}
                          </span>
                          <span>•</span>
                          <span>{format(new Date(thread.createdAt), 'PPp')}</span>
                          {thread.lessonId && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {allLessons.find((l: any) => l.id === thread.lessonId)
                                  ?.titleEn || t('lesson')}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      {thread.hasSolution && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t('solved')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">{thread.content}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => upvoteThreadMutation.mutate(thread.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {thread.likesCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === thread.id ? null : thread.id)}
                      >
                        <ReplyIcon className="h-4 w-4 mr-1" />
                        {thread.repliesCount} {t('replies')}
                      </Button>
                    </div>
                    {replyingTo === thread.id && (
                      <div className="mt-4 space-y-2">
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={t('replyPlaceholder')}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(thread.id)}
                            disabled={replyMutation.isPending}
                          >
                            {t('postReply')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                          >
                            {t('cancel')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
