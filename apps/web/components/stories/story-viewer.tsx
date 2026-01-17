'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Heart,
  Send,
  Pause,
  Play
} from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useMarkStoryAsViewed } from '@/lib/hooks/use-api';
import { Input } from '@/components/ui/input';

interface StoryViewerProps {
  stories: any[];
  initialIndex: number;
  onClose: () => void;
}

/**
 * StoryViewer Component
 * Full-screen story viewer with auto-advance
 * 
 * RTL/LTR Support:
 * - Navigation arrows flip in RTL (using rtl:rotate-180)
 * - Progress bars flow correctly
 * - Text overlays align with text-start
 * 
 * Theme Support:
 * - Semi-transparent overlays work in both themes
 * - Text with shadows for visibility on any background
 * - Controls visible in both themes
 */
export function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  const markViewedMutation = useMarkStoryAsViewed();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserStories = stories[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];
  const totalStories = currentUserStories?.stories.length || 0;

  // Auto-advance timer
  useEffect(() => {
    if (!currentStory || isPaused) return;

    const duration = currentStory.mediaType === 'video' 
      ? (currentStory.duration || 15) * 1000 
      : 5000;

    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    // Mark as viewed
    if (!currentStory.isViewed) {
      markViewedMutation.mutate(currentStory.id);
    }

    timerRef.current = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        nextStory();
      }
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentStory, isPaused, currentUserIndex, currentStoryIndex]);

  const nextStory = () => {
    setProgress(0);
    
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    setProgress(0);
    
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
      const prevUserStories = stories[currentUserIndex - 1];
      setCurrentStoryIndex(prevUserStories.stories.length - 1);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (!currentStory) return null;

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md md:max-w-lg p-0 border-0 bg-black/95">
        <DialogDescription className="sr-only">
          Story viewer - {currentStory.userName}'s story
        </DialogDescription>
        <div className="relative aspect-[9/16] max-h-[90vh]">
          {/* Story Progress Bars */}
          <div className="absolute top-2 inset-x-2 z-20 flex gap-1">
            {currentUserStories.stories.map((_: any, index: number) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <Progress
                  value={
                    index < currentStoryIndex ? 100 :
                    index === currentStoryIndex ? progress : 0
                  }
                  className="h-full bg-white"
                />
              </div>
            ))}
          </div>

          {/* Story Header */}
          <div className="absolute top-8 inset-x-4 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white">
                  <AvatarImage src={currentUserStories.user.avatar} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {currentUserStories.user.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-start">
                  <p className="text-sm font-semibold text-white drop-shadow-lg">
                    {currentUserStories.user.firstName} {currentUserStories.user.lastName}
                  </p>
                  <p className="text-xs text-white/80 drop-shadow-lg">
                    {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={togglePause}
                >
                  {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Story Media */}
          <div className="absolute inset-0">
            {currentStory.mediaType === 'image' ? (
              <Image
                src={currentStory.mediaUrl}
                alt="Story"
                fill
                className="object-contain"
                priority
              />
            ) : (
              <video
                src={currentStory.mediaUrl}
                className="w-full h-full object-contain"
                autoPlay
                muted
                playsInline
              />
            )}
          </div>

          {/* Story Caption */}
          {currentStory.caption && (
            <div className="absolute bottom-20 inset-x-4 z-20">
              <p className="text-white text-sm text-center drop-shadow-lg px-4 py-2 bg-black/30 rounded-lg backdrop-blur-sm">
                {currentStory.caption}
              </p>
            </div>
          )}

          {/* Navigation Areas */}
          <button
            onClick={prevStory}
            className="absolute inset-y-0 start-0 w-1/3 cursor-pointer"
            aria-label="Previous story"
          />
          <button
            onClick={nextStory}
            className="absolute inset-y-0 end-0 w-1/3 cursor-pointer"
            aria-label="Next story"
          />

          {/* Story Actions */}
          <div className="absolute bottom-4 inset-x-4 z-20">
            {showReply ? (
              <div className="flex gap-2">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Reply to story..."
                  className="bg-white/90 text-foreground border-0 text-start"
                  autoFocus
                />
                <Button
                  size="icon"
                  onClick={() => {
                    // Handle reply
                    setReplyText('');
                    setShowReply(false);
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 gap-2"
                  onClick={() => setShowReply(true)}
                >
                  <Send className="h-4 w-4" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Arrows (visible on desktop) */}
          <div className="hidden md:block">
            {currentUserIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute start-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                onClick={prevStory}
              >
                <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
              </Button>
            )}
            {currentUserIndex < stories.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute end-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                onClick={nextStory}
              >
                <ChevronRight className="h-6 w-6 rtl:rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
