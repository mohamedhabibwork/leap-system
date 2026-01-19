'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Facebook, Twitter, Linkedin, Mail, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateShare, useCreatePost } from '@/lib/hooks/use-api';
import { useTranslations } from 'next-intl';

interface ShareButtonProps {
  entityType: string;
  entityId: number;
  url: string;
  title: string;
  size?: 'sm' | 'default' | 'lg';
  showCount?: boolean;
  shareCount?: number;
}

export function ShareButton({
  entityType,
  entityId,
  url,
  title,
  size = 'sm',
  showCount = false,
  shareCount = 0,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [showTimelineShare, setShowTimelineShare] = useState(false);
  const [shareComment, setShareComment] = useState('');
  const [shareVisibility, setShareVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [isSharing, setIsSharing] = useState(false);
  const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`;
  const createShare = useCreateShare();
  const createPost = useCreatePost();
  const t = useTranslations('social');

  const trackShare = async (shareType: string) => {
    try {
      await createShare.mutateAsync({
        entityType,
        entityId,
        shareType,
      });
    } catch (error) {
      // Silent fail for tracking - don't interrupt user experience
      console.error('Failed to track share:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success(t('share.linkCopied') || 'Link copied to clipboard!');
    trackShare('link');
  };

  const shareToSocial = async (platform: string) => {
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);

    // Try Web Share API first if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: title,
          url: fullUrl,
        });
        trackShare(platform);
        return;
      } catch (error) {
        // User cancelled or share failed, fall through to platform-specific URL
        if ((error as Error).name === 'AbortError') {
          return; // User cancelled, don't open fallback
        }
        // For other errors, fall through to platform-specific URL
      }
    }

    // Fallback to platform-specific URLs
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      trackShare(platform);
    }
  };

  const shareToTimeline = async () => {
    if (entityType !== 'post') {
      toast.error(t('share.onlyPosts') || 'Only posts can be shared to timeline');
      return;
    }

    setIsSharing(true);
    try {
      await createPost.mutateAsync({
        data: {
          content: shareComment.trim() || '',
          post_type: 'text',
          visibility: shareVisibility,
          shared_post_id: entityId,
        },
      });
      
      toast.success(t('share.sharedToTimeline') || 'Post shared to your timeline!');
      trackShare('timeline');
      setOpen(false);
      setShowTimelineShare(false);
      setShareComment('');
      setShareVisibility('public');
    } catch (error: any) {
      console.error('Failed to share to timeline:', error);
      toast.error(error?.response?.data?.message || t('share.error') || 'Failed to share post');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Share2 className="h-4 w-4" />
        {showCount && shareCount > 0 && <span className="ml-1">{shareCount}</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('share.title') || `Share ${entityType}`}</DialogTitle>
            <DialogDescription>{title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Share to Timeline - Only for posts */}
            {entityType === 'post' && (
              <div>
                <Label>{t('share.shareToTimeline') || 'Share to Timeline'}</Label>
                {!showTimelineShare ? (
                  <Button
                    variant="outline"
                    className="w-full mt-2 flex items-center gap-2 justify-start"
                    onClick={() => setShowTimelineShare(true)}
                  >
                    <Home className="h-4 w-4" />
                    <span>{t('share.shareToTimeline') || 'Share to Timeline'}</span>
                  </Button>
                ) : (
                  <div className="mt-2 space-y-3 p-4 border rounded-lg bg-muted/30">
                    <div>
                      <Label htmlFor="share-comment" className="text-sm">
                        {t('share.addComment') || 'Add a comment (optional)'}
                      </Label>
                      <Textarea
                        id="share-comment"
                        value={shareComment}
                        onChange={(e) => setShareComment(e.target.value)}
                        placeholder={t('share.commentPlaceholder') || 'Write a comment...'}
                        className="mt-1 min-h-[80px]"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {shareComment.length}/500
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="share-visibility" className="text-sm">
                        {t('share.visibility') || 'Visibility'}
                      </Label>
                      <Select
                        value={shareVisibility}
                        onValueChange={(value: 'public' | 'friends' | 'private') =>
                          setShareVisibility(value)
                        }
                      >
                        <SelectTrigger id="share-visibility" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            {t('share.visibilityPublic') || 'Public'}
                          </SelectItem>
                          <SelectItem value="friends">
                            {t('share.visibilityFriends') || 'Friends'}
                          </SelectItem>
                          <SelectItem value="private">
                            {t('share.visibilityPrivate') || 'Private'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowTimelineShare(false);
                          setShareComment('');
                        }}
                        className="flex-1"
                      >
                        {t('share.cancel') || 'Cancel'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={shareToTimeline}
                        disabled={isSharing}
                        className="flex-1"
                      >
                        {isSharing
                          ? t('share.sharing') || 'Sharing...'
                          : t('share.share') || 'Share'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* External Platform Sharing */}
            <div>
              <Label>{t('share.shareVia') || 'Share via'}</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <Button
                  variant="outline"
                  className="flex flex-col gap-2 h-auto py-3"
                  onClick={() => shareToSocial('facebook')}
                >
                  <Facebook className="h-5 w-5" />
                  <span className="text-xs">Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col gap-2 h-auto py-3"
                  onClick={() => shareToSocial('twitter')}
                >
                  <Twitter className="h-5 w-5" />
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col gap-2 h-auto py-3"
                  onClick={() => shareToSocial('linkedin')}
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col gap-2 h-auto py-3"
                  onClick={() => shareToSocial('email')}
                >
                  <Mail className="h-5 w-5" />
                  <span className="text-xs">Email</span>
                </Button>
              </div>
            </div>

            {/* Copy Link */}
            <div>
              <Label>{t('share.copyLink') || 'Copy link'}</Label>
              <div className="flex gap-2 mt-2">
                <Input value={fullUrl} readOnly className="flex-1" />
                <Button onClick={copyToClipboard} size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
