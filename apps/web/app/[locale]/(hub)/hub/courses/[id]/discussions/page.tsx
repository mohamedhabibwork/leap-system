'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCourse } from '@/lib/hooks/use-api';
import { discussionsAPI, CreateThreadDto, Thread, Reply } from '@/lib/api/discussions';
import { PageLoader } from '@/components/loading/page-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Plus, 
  ThumbsUp, 
  Reply as ReplyIcon,
  CheckCircle2,
  Filter,
  Search
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

export default function CourseDiscussionsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const t = useTranslations('courses.discussions');
  const { id } = use(params);
  const courseId = parseInt(id);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);

  const { data: course, isLoading: courseLoading } = useCourse(courseId);

  const { data: threads, isLoading: threadsLoading } = useQuery({
    queryKey: ['course-threads', courseId, sortBy],
    queryFn: () => discussionsAPI.getCourseThreads(courseId, { sortBy }),
    enabled: !!courseId,
  });

  const createThreadMutation = useMutation({
    mutationFn: (data: CreateThreadDto) => discussionsAPI.createThread(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-threads', courseId] });
      setShowCreateDialog(false);
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ threadId, data }: { threadId: number; data: { content: string } }) =>
      discussionsAPI.replyToThread(threadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-threads', courseId] });
      setShowReplyDialog(false);
    },
  });

  const upvoteThreadMutation = useMutation({
    mutationFn: (threadId: number) => discussionsAPI.upvoteThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-threads', courseId] });
    },
  });

  if (courseLoading || threadsLoading) {
    return <PageLoader message={t('loading', { defaultValue: 'Loading discussions...' })} />;
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <p>{t('notFound', { defaultValue: 'Course not found' })}</p>
      </div>
    );
  }

  const filteredThreads = threads?.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-2">
            {t('discussions', { defaultValue: 'Course Discussions' })}
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('newThread', { defaultValue: 'New Thread' })}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('createThread', { defaultValue: 'Create New Thread' })}</DialogTitle>
              <DialogDescription>
                {t('createThreadDesc', { defaultValue: 'Start a new discussion thread' })}
              </DialogDescription>
            </DialogHeader>
            <CreateThreadForm
              onSubmit={(data) => createThreadMutation.mutate(data)}
              isLoading={createThreadMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchThreads', { defaultValue: 'Search threads...' })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['recent', 'popular', 'unanswered'] as const).map((sort) => (
            <Button
              key={sort}
              variant={sortBy === sort ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(sort)}
            >
              {t(`sort.${sort}`, { defaultValue: sort })}
            </Button>
          ))}
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {filteredThreads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t('noThreads', { defaultValue: 'No discussion threads yet. Be the first to start a discussion!' })}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredThreads.map((thread) => (
            <Card key={thread.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{thread.title}</CardTitle>
                      {thread.hasSolution && (
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t('solved', { defaultValue: 'Solved' })}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={thread.user.avatarUrl} />
                          <AvatarFallback>
                            {thread.user.firstName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {thread.user.firstName} {thread.user.lastName}
                        </span>
                      </div>
                      <span>
                        {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 line-clamp-3">{thread.content}</p>
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
                    onClick={() => {
                      setSelectedThread(thread);
                      setShowReplyDialog(true);
                    }}
                  >
                    <ReplyIcon className="h-4 w-4 mr-1" />
                    {thread.repliesCount} {t('replies', { defaultValue: 'replies' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('replyToThread', { defaultValue: 'Reply to Thread' })}
            </DialogTitle>
            {selectedThread && (
              <DialogDescription>
                {selectedThread.title}
              </DialogDescription>
            )}
          </DialogHeader>
          <ReplyForm
            onSubmit={(data) => {
              if (selectedThread) {
                replyMutation.mutate({ threadId: selectedThread.id, data });
              }
            }}
            isLoading={replyMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateThreadForm({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (data: CreateThreadDto) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit({ title, content });
      setTitle('');
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Thread title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Thread content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Thread'}
      </Button>
    </form>
  );
}

function ReplyForm({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (data: { content: string }) => void;
  isLoading: boolean;
}) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit({ content });
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Your reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Posting...' : 'Post Reply'}
      </Button>
    </form>
  );
}
