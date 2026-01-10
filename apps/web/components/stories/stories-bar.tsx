'use client';

import { useStories } from '@/lib/hooks/use-api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { StoryRing } from './story-ring';
import { useState } from 'react';
import { StoryViewer } from './story-viewer';
import { StoryCreator } from './story-creator';

/**
 * StoriesBar Component
 * Horizontal carousel of user stories
 * 
 * RTL/LTR Support:
 * - Scroll direction adapts automatically
 * - Story items flow in reading direction
 * - Plus button for creating story positioned correctly
 * 
 * Theme Support:
 * - Backgrounds and borders adapt to theme
 * - Avatar rings visible in both themes
 * - Hover states work in light and dark
 */
export function StoriesBar() {
  const { data: stories, isLoading } = useStories();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-muted" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return null;
  }

  // Group stories by user
  const groupedStories = stories.reduce((acc: any, story: any) => {
    const userId = story.userId;
    if (!acc[userId]) {
      acc[userId] = {
        user: story.user,
        stories: [],
      };
    }
    acc[userId].stories.push(story);
    return acc;
  }, {});

  const userStories = Object.values(groupedStories);

  return (
    <>
      <div className="bg-card border-y border-border">
        <ScrollArea className="w-full">
          <div className="flex gap-4 p-4">
            {/* Create Story Button */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                className="w-16 h-16 rounded-full border-2 border-dashed border-primary hover:bg-primary/10 transition-colors"
                onClick={() => setShowCreator(true)}
              >
                <Plus className="w-6 h-6 text-primary" />
              </Button>
              <span className="text-xs font-medium text-center">Create</span>
            </div>

            {/* User Stories */}
            {userStories.map((userStory: any, index: number) => (
              <button
                key={userStory.user.id}
                onClick={() => setSelectedStoryIndex(index)}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <StoryRing
                  hasUnviewed={userStory.stories.some((s: any) => !s.isViewed)}
                  size="large"
                >
                  <Avatar className="w-16 h-16 border-2 border-background">
                    <AvatarImage src={userStory.user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userStory.user.firstName?.[0]}
                      {userStory.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </StoryRing>
                <span className="text-xs font-medium text-center max-w-[70px] truncate group-hover:text-primary transition-colors">
                  {userStory.user.firstName}
                </span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={userStories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}

      {/* Story Creator Modal */}
      <StoryCreator
        open={showCreator}
        onOpenChange={setShowCreator}
      />
    </>
  );
}
