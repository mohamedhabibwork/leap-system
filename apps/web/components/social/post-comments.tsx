'use client';

import { useState, useRef, useEffect } from 'react';
import { useComments, useCreateComment } from '@/lib/hooks/use-api';
import { useProfile } from '@/lib/hooks/use-profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LikeButton } from '@/components/buttons/like-button';
import { MoreHorizontal, Reply, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { UserHoverCard } from '@/components/shared/user-hover-card';

interface PostCommentsProps {
  postId: number;
  userId: number;
  onCommentAdded?: () => void;
  maxVisible?: number;
}

export function PostComments({ postId, userId, onCommentAdded, maxVisible = 3 }: PostCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { data: commentsResponse, isLoading } = useComments('post', postId);
  const createComment = useCreateComment();
  const { data: currentUserProfile } = useProfile();
  
  // Handle both direct array and wrapped response
  const allComments = Array.isArray(commentsResponse) 
    ? commentsResponse 
    : commentsResponse?.data || [];
  
  // Filter top-level comments (no parent)
  const topLevelComments = allComments.filter((c: any) => !c.parentCommentId);
  
  // Group replies by parent comment
  const repliesByParent = allComments.reduce((acc: Record<number, any[]>, comment: any) => {
    if (comment.parentCommentId) {
      if (!acc[comment.parentCommentId]) {
        acc[comment.parentCommentId] = [];
      }
      acc[comment.parentCommentId].push(comment);
    }
    return acc;
  }, {});

  const visibleComments = showAllComments 
    ? topLevelComments 
    : topLevelComments.slice(0, maxVisible);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        commentableType: 'post',
        commentableId: postId,
        content: newComment,
        parentCommentId: replyingTo,
      });
      setNewComment('');
      setReplyingTo(null);
      toast.success('Comment posted!');
      onCommentAdded?.();
      // Auto-focus back to input
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleReply = (commentId: number, username?: string) => {
    setReplyingTo(commentId);
    setNewComment(username ? `@${username} ` : '');
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const toggleReplies = (commentId: number) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Comments List */}
      {visibleComments.length > 0 && (
        <div className="space-y-4">
          {visibleComments.map((comment: any) => {
            const replies = repliesByParent[comment.id] || [];
            const hasReplies = replies.length > 0;
            const showReplies = expandedReplies.has(comment.id);
            
            return (
              <div key={comment.id} className="flex gap-3">
                <UserHoverCard
                  user={{
                    id: comment.user?.id || 0,
                    firstName: comment.user?.firstName || '',
                    lastName: comment.user?.lastName || '',
                    avatar: comment.user?.avatar || '',
                  }}
                >
                  <Link href={`/hub/social/profile/${comment.user?.id}`}>
                    <Avatar className="h-8 w-8 shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                      <AvatarImage src={comment.user?.avatar} />
                      <AvatarFallback className="text-xs">
                        {comment.user?.firstName?.[0] || ''}
                        {comment.user?.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </UserHoverCard>
                
                <div className="flex-1 min-w-0">
                  <div className="bg-muted/50 rounded-2xl px-3 py-2 inline-block max-w-full">
                    <div className="flex items-baseline gap-2 mb-1">
                      <UserHoverCard
                        user={{
                          id: comment.user?.id || 0,
                          firstName: comment.user?.firstName || '',
                          lastName: comment.user?.lastName || '',
                          avatar: comment.user?.avatar || '',
                        }}
                      >
                        <Link
                          href={`/hub/social/profile/${comment.user?.id}`}
                          className="font-semibold text-[13px] hover:underline text-foreground"
                        >
                          {comment.user?.firstName} {comment.user?.lastName}
                        </Link>
                      </UserHoverCard>
                    </div>
                    <p className="text-[15px] leading-[1.3333] wrap-break-word whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 ml-1">
                    <LikeButton
                      entityType="comment"
                      entityId={comment.id}
                      isLiked={comment.isLiked}
                      likeCount={comment.likesCount || 0}
                      size="sm"
                      showCount={true}
                    />
                    <button
                      onClick={() => handleReply(comment.id, comment.user?.username)}
                      className="text-[13px] text-muted-foreground hover:underline font-medium"
                    >
                      Reply
                    </button>
                    <span className="text-[13px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem>Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Replies */}
                  {hasReplies && (
                    <div className="mt-2 ml-4">
                      {!showReplies && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="text-[13px] text-blue-500 hover:underline font-medium mb-2"
                        >
                          View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                      )}
                      
                      {showReplies && (
                        <div className="space-y-3 mt-2">
                          {replies.map((reply: any) => (
                            <div key={reply.id} className="flex gap-3">
                              <UserHoverCard
                                user={{
                                  id: reply.user?.id || 0,
                                  firstName: reply.user?.firstName || '',
                                  lastName: reply.user?.lastName || '',
                                  avatar: reply.user?.avatar || '',
                                }}
                              >
                                <Link href={`/hub/social/profile/${reply.user?.id}`}>
                                  <Avatar className="h-7 w-7 shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                                    <AvatarImage src={reply.user?.avatar} />
                                    <AvatarFallback className="text-[10px]">
                                      {reply.user?.firstName?.[0] || ''}
                                      {reply.user?.lastName?.[0] || ''}
                                    </AvatarFallback>
                                  </Avatar>
                                </Link>
                              </UserHoverCard>
                              
                              <div className="flex-1 min-w-0">
                                <div className="bg-muted/50 rounded-2xl px-3 py-2 inline-block max-w-full">
                                  <div className="flex items-baseline gap-2 mb-1">
                                    <UserHoverCard
                                      user={{
                                        id: reply.user?.id || 0,
                                        firstName: reply.user?.firstName || '',
                                        lastName: reply.user?.lastName || '',
                                        avatar: reply.user?.avatar || '',
                                      }}
                                    >
                                      <Link
                                        href={`/hub/social/profile/${reply.user?.id}`}
                                        className="font-semibold text-[13px] hover:underline text-foreground"
                                      >
                                        {reply.user?.firstName} {reply.user?.lastName}
                                      </Link>
                                    </UserHoverCard>
                                  </div>
                                  <p className="text-[15px] leading-[1.3333] wrap-break-word whitespace-pre-wrap">
                                    {reply.content}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-1 ml-1">
                                  <LikeButton
                                    entityType="comment"
                                    entityId={reply.id}
                                    isLiked={reply.isLiked}
                                    likeCount={reply.likesCount || 0}
                                    size="sm"
                                    showCount={true}
                                  />
                                  <button
                                    onClick={() => handleReply(comment.id, reply.user?.username)}
                                    className="text-[13px] text-muted-foreground hover:underline font-medium"
                                  >
                                    Reply
                                  </button>
                                  <span className="text-[13px] text-muted-foreground">
                                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <button
                            onClick={() => toggleReplies(comment.id)}
                            className="text-[13px] text-blue-500 hover:underline font-medium ml-10"
                          >
                            Hide replies
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show More Comments */}
      {!showAllComments && topLevelComments.length > maxVisible && (
        <button
          onClick={() => setShowAllComments(true)}
          className="text-[13px] text-blue-500 hover:underline font-medium px-4"
        >
          View {topLevelComments.length - maxVisible} more {topLevelComments.length - maxVisible === 1 ? 'comment' : 'comments'}
        </button>
      )}

      {/* Comment Input */}
      <div className="flex gap-2 pt-2">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={currentUserProfile?.avatarUrl} />
          <AvatarFallback className="text-xs">
            {currentUserProfile?.firstName?.[0] || ''}
            {currentUserProfile?.lastName?.[0] || ''}
            {!currentUserProfile?.firstName && !currentUserProfile?.lastName && 'ME'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 flex items-end gap-2">
          <div className="flex-1 relative">
            {replyingTo && (
              <div className="absolute -top-6 left-0 text-[12px] text-muted-foreground mb-1">
                Replying to {allComments.find((c: any) => c.id === replyingTo)?.user?.firstName || 'comment'}
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment('');
                  }}
                  className="ml-2 text-blue-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}
            <Textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
              rows={1}
              className="min-h-[36px] max-h-[100px] resize-none rounded-2xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring pr-10 text-[15px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            {newComment.trim() && (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newComment.trim() || createComment.isPending}
                className="absolute right-2 bottom-1.5 h-7 w-7 p-0 rounded-full"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
