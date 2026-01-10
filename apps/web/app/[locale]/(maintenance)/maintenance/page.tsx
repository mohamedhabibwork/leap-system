'use client';

import { useState, useEffect } from 'react';
import { Wrench, Clock, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MaintenancePage() {
  // Set your maintenance end time here
  const maintenanceEndTime = new Date('2024-01-15T10:00:00').getTime();
  
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = maintenanceEndTime - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [maintenanceEndTime]);

  const handleNotifySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement email notification
    alert('You\'ll be notified when we\'re back online!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center">
        {/* Maintenance Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-6">
            <Wrench className="h-16 w-16 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
          We'll Be Right Back
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          We're performing scheduled maintenance to improve your experience. We'll be back online shortly.
        </p>

        {/* Maintenance Reason */}
        <div className="p-6 rounded-2xl border border-border bg-card mb-8 max-w-2xl mx-auto">
          <h3 className="font-semibold text-foreground mb-2">What We're Working On</h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
            <li>• Upgrading our server infrastructure</li>
            <li>• Improving platform performance</li>
            <li>• Rolling out new features</li>
            <li>• Enhancing security measures</li>
          </ul>
        </div>

        {/* Countdown Timer */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4" />
            <span>Expected completion time</span>
          </div>
          <div className="flex justify-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center p-4 rounded-xl bg-muted min-w-[80px]">
              <span className="text-3xl sm:text-4xl font-bold text-foreground">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground mt-1">Hours</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-muted min-w-[80px]">
              <span className="text-3xl sm:text-4xl font-bold text-foreground">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground mt-1">Minutes</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-muted min-w-[80px]">
              <span className="text-3xl sm:text-4xl font-bold text-foreground">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground mt-1">Seconds</span>
            </div>
          </div>
        </div>

        {/* Email Notification Form */}
        <div className="max-w-md mx-auto mb-12">
          <h3 className="font-semibold text-foreground mb-4">
            Get Notified When We're Back
          </h3>
          <form onSubmit={handleNotifySubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="your.email@example.com"
              required
              className="flex-1"
            />
            <Button type="submit">Notify Me</Button>
          </form>
        </div>

        {/* Social Links */}
        <div className="pt-8 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Stay Connected
          </h3>
          <div className="flex gap-4 justify-center">
            <a
              href="https://twitter.com/leappm"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/company/leappm"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="mailto:support@leappm.com"
              className="p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Status Page Link */}
        <div className="mt-8">
          <a
            href="https://status.leappm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Status Page for Updates
          </a>
        </div>
      </div>
    </div>
  );
}
