'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface QuizTimerProps {
  timeLimitMinutes: number;
  startedAt: Date;
  onTimeUp?: () => void;
}

export function QuizTimer({ timeLimitMinutes, startedAt, onTimeUp }: QuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const start = new Date(startedAt).getTime();
      const elapsed = Math.floor((now - start) / 1000); // seconds
      const limit = timeLimitMinutes * 60; // convert to seconds
      const remaining = Math.max(0, limit - elapsed);
      
      if (remaining === 0 && onTimeUp) {
        onTimeUp();
      }
      
      return remaining;
    };

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimitMinutes, startedAt, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const isLowTime = timeRemaining < 300; // Less than 5 minutes
  const isCritical = timeRemaining < 60; // Less than 1 minute

  return (
    <Card className={`p-4 ${isCritical ? 'bg-red-50 border-red-300' : isLowTime ? 'bg-yellow-50 border-yellow-300' : ''}`}>
      <div className="flex items-center gap-2">
        <Clock className={`h-5 w-5 ${isCritical ? 'text-red-600' : isLowTime ? 'text-yellow-600' : 'text-gray-600'}`} />
        <div>
          <p className="text-sm text-gray-600">Time Remaining</p>
          <p className={`text-2xl font-bold ${isCritical ? 'text-red-600' : isLowTime ? 'text-yellow-600' : 'text-gray-900'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>
      </div>
    </Card>
  );
}
