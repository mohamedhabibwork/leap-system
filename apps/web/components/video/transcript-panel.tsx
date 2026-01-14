'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSegmentClick: (time: number) => void;
}

export function TranscriptPanel({
  segments,
  currentTime,
  onSegmentClick,
}: TranscriptPanelProps) {
  const t = useTranslations('courses.player');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLButtonElement>(null);

  const filteredSegments = segments.filter((segment) =>
    segment.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSegmentIndex = filteredSegments.findIndex(
    (segment) => currentTime >= segment.startTime && currentTime < segment.endTime
  );

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && !searchQuery) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeSegmentIndex, searchQuery]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-300 dark:bg-yellow-700">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchTranscript', { defaultValue: 'Search transcript...' })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10"
          />
        </div>
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-2">
            {filteredSegments.length} result{filteredSegments.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Transcript List */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-2">
          {filteredSegments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery
                ? t('noTranscriptResults', { defaultValue: 'No results found' })
                : t('noTranscript', { defaultValue: 'No transcript available' })}
            </p>
          ) : (
            filteredSegments.map((segment, index) => {
              const isActive = index === activeSegmentIndex;
              return (
                <button
                  key={segment.id}
                  ref={isActive ? activeSegmentRef : null}
                  onClick={() => onSegmentClick(segment.startTime)}
                  className={cn(
                    'w-full text-start p-3 rounded-lg transition-colors',
                    'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive && 'bg-accent'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'text-xs font-medium shrink-0 mt-0.5',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {formatTime(segment.startTime)}
                    </span>
                    <p className="text-sm leading-relaxed">
                      {highlightText(segment.text, searchQuery)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
