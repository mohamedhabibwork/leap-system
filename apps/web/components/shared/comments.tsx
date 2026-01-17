'use client';

import { useState } from 'react';
import { useComments, useCreateComment } from '@/lib/hooks/use-api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, MoreVertical, Heart, Reply } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface CommentsProps {
  entityType: string;
  entityId: number;
  entityUserId: number;
}

export function Comments({ entityType, entityId, entityUserId }: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const { data: comments, isLoading } = useComments(entityType, entityId);
  const createComment = useCreateComment();

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        commentableType:entityType,
        commentableId:entityId,
        content: newComment,
        parentCommentId: replyTo,
      });
      setNewComment('');
      setReplyTo(null);
      toast.success('Comment posted!');
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments ({comments?.length || 0})</h3>

      {/* Comment Input */}
      <Card className="p-4">
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={undefined} />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
              rows={3}
              className="mb-2"
            />
            <div className="flex justify-between items-center">
              {replyTo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment('');
                  }}
                >
                  Cancel Reply
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newComment.trim() || createComment.isPending}
                className="ms-auto"
              >
                <Send className="me-2 h-4 w-4" />
                {createComment.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.map((comment: any) => (
          <Card key={comment.id} className="p-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={comment.user?.avatar} />
                <AvatarFallback>
                  {comment.user?.firstName?.[0]}{comment.user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {comment.user?.firstName} {comment.user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem>Report</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="mt-2 text-sm">{comment.content}</p>

                <div className="flex gap-4 mt-3">
                  <Button variant="ghost" size="sm">
                    <Heart className="me-1 h-3 w-3" />
                    Like {comment.likeCount > 0 && `(${comment.likeCount})`}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyTo(comment.id);
                      setNewComment(`@${comment.user?.username} `);
                    }}
                  >
                    <Reply className="me-1 h-3 w-3" />
                    Reply
                  </Button>
                </div>

                {/* Nested Replies */}
                {comment.replies?.length > 0 && (
                  <div className="ms-8 mt-4 space-y-3 border-s-2 ps-4">
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id} className="flex gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={reply.user?.avatar} />
                          <AvatarFallback>{reply.user?.firstName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            {reply.user?.firstName} {reply.user?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(reply.createdAt), 'MMM d • h:mm a')}
                          </p>
                          <p className="text-sm mt-1">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
