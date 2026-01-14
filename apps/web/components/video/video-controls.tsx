'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  PictureInPicture,
  SkipForward,
  SkipBack,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  showControls: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onFullscreen: () => void;
  onPiP: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  className?: string;
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function VideoControls({
  isPlaying,
  isMuted,
  volume,
  currentTime,
  duration,
  playbackSpeed,
  showControls,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onSeek,
  onSpeedChange,
  onFullscreen,
  onPiP,
  onSkipForward,
  onSkipBackward,
  className,
}: VideoControlsProps) {
  const t = useTranslations('courses.player');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        'absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300',
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
    >
      {/* Progress Bar */}
      <div className="px-4 pb-2">
        <Slider
          value={[progressPercentage]}
          max={100}
          step={0.1}
          onValueChange={([value]) => onSeek((value / 100) * duration)}
          className="cursor-pointer"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 pb-4">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPlayPause}
            className="text-white hover:bg-white/20 h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onSkipBackward}
            className="text-white hover:bg-white/20 h-9 w-9"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onSkipForward}
            className="text-white hover:bg-white/20 h-9 w-9"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 group">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMuteToggle}
              className="text-white hover:bg-white/20 h-9 w-9"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <div className="hidden group-hover:block w-20">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={([value]) => onVolumeChange(value / 100)}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Time Display */}
          <span className="text-white text-sm font-medium ms-2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Playback Speed */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-9"
              >
                <Settings className="h-4 w-4 me-2" />
                {playbackSpeed}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {playbackSpeeds.map((speed) => (
                <DropdownMenuItem
                  key={speed}
                  onClick={() => onSpeedChange(speed)}
                  className={cn(
                    playbackSpeed === speed && 'bg-accent'
                  )}
                >
                  {speed}x {speed === 1 && '(Normal)'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Picture-in-Picture */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onPiP}
            className="text-white hover:bg-white/20 h-9 w-9"
          >
            <PictureInPicture className="h-4 w-4" />
          </Button>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onFullscreen}
            className="text-white hover:bg-white/20 h-9 w-9"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
