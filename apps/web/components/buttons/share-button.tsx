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
import { Copy, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { toast } from 'sonner';

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
  const fullUrl = `${window.location.origin}${url}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied to clipboard!');
  };

  const shareToSocial = (platform: string) => {
    let shareUrl = '';
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedTitle = encodeURIComponent(title);

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share {entityType}</DialogTitle>
            <DialogDescription>{title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Share via</Label>
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

            <div>
              <Label>Copy link</Label>
              <div className="flex gap-2 mt-2">
                <Input value={fullUrl} readOnly />
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
