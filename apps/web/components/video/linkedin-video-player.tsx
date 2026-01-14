'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { VideoControls } from './video-controls';
import { ChapterMarkers, type Chapter } from './chapter-markers';
import { TranscriptPanel, type TranscriptSegment } from './transcript-panel';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LinkedInVideoPlayerProps {
  src: string;
  poster?: string;
  chapters?: Chapter[];
  transcript?: TranscriptSegment[];
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  className?: string;
  autoPlay?: boolean;
}

export function LinkedInVideoPlayer({
  src,
  poster,
  chapters = [],
  transcript = [],
  onProgress,
  onComplete,
  className,
  autoPlay = false,
}: LinkedInVideoPlayerProps) {
  const t = useTranslations('courses.player');
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hideControlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime, video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onComplete]);

  // Auto-hide controls
  const resetHideControlsTimer = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          handleSkipBackward();
          break;
        case 'ArrowRight':
          handleSkipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(volume + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(volume - 0.1, 0));
          break;
        case 'f':
          handleFullscreen();
          break;
        case 'm':
          handleMuteToggle();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [volume, isPlaying]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePiP = async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error);
    }
  };

  const handleSkipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(currentTime + 10, duration);
  };

  const handleSkipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(currentTime - 10, 0);
  };

  const handleChapterClick = (startTime: number) => {
    handleSeek(startTime);
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Video Container */}
      <div
        ref={containerRef}
        className={cn(
          'relative bg-black rounded-lg overflow-hidden group flex-1',
          isFullscreen && 'rounded-none',
          className
        )}
        onMouseMove={resetHideControlsTimer}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-contain"
          onClick={handlePlayPause}
          autoPlay={autoPlay}
        />

        {/* Chapter Markers */}
        {chapters.length > 0 && (
          <div className="absolute inset-x-0 bottom-20 px-4">
            <ChapterMarkers
              chapters={chapters}
              duration={duration}
              currentTime={currentTime}
              onChapterClick={handleChapterClick}
            />
          </div>
        )}

        {/* Video Controls */}
        <VideoControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          currentTime={currentTime}
          duration={duration}
          playbackSpeed={playbackSpeed}
          showControls={showControls}
          onPlayPause={handlePlayPause}
          onMuteToggle={handleMuteToggle}
          onVolumeChange={handleVolumeChange}
          onSeek={handleSeek}
          onSpeedChange={handleSpeedChange}
          onFullscreen={handleFullscreen}
          onPiP={handlePiP}
          onSkipForward={handleSkipForward}
          onSkipBackward={handleSkipBackward}
        />

        {/* Transcript Toggle Button */}
        {transcript.length > 0 && !isFullscreen && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className={cn(
              'absolute top-4 end-4 z-20 transition-opacity',
              showControls ? 'opacity-100' : 'opacity-0'
            )}
          >
            <FileText className="h-4 w-4 me-2" />
            {t('transcript', { defaultValue: 'Transcript' })}
          </Button>
        )}
      </div>

      {/* Transcript Panel */}
      {showTranscript && transcript.length > 0 && !isFullscreen && (
        <div className="w-96 border-s bg-background flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">
              {t('transcript', { defaultValue: 'Transcript' })}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTranscript(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <TranscriptPanel
            segments={transcript}
            currentTime={currentTime}
            onSegmentClick={handleSeek}
          />
        </div>
      )}
    </div>
  );
}
