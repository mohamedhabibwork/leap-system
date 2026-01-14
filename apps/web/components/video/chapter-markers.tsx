'use client';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface Chapter {
  id: string;
  title: string;
  startTime: number; // in seconds
  endTime: number;
}

interface ChapterMarkersProps {
  chapters: Chapter[];
  duration: number;
  currentTime: number;
  onChapterClick: (startTime: number) => void;
}

export function ChapterMarkers({
  chapters,
  duration,
  currentTime,
  onChapterClick,
}: ChapterMarkersProps) {
  if (!chapters.length || duration === 0) return null;

  return (
    <TooltipProvider>
      <div className="absolute inset-x-4 top-0 h-1 flex gap-[2px]">
        {chapters.map((chapter) => {
          const startPercentage = (chapter.startTime / duration) * 100;
          const width = ((chapter.endTime - chapter.startTime) / duration) * 100;
          const isActive = currentTime >= chapter.startTime && currentTime < chapter.endTime;

          return (
            <Tooltip key={chapter.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onChapterClick(chapter.startTime)}
                  className={cn(
                    'h-full transition-all hover:opacity-80 rounded-sm',
                    isActive ? 'bg-primary' : 'bg-white/30'
                  )}
                  style={{
                    marginInlineStart: `${startPercentage}%`,
                    width: `${width}%`,
                  }}
                  aria-label={`Jump to ${chapter.title}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm font-medium">{chapter.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(chapter.startTime)}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
