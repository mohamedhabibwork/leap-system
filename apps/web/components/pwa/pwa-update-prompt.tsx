'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';

export function PWAUpdatePrompt() {
  const { isUpdateAvailable, update } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setShowPrompt(true);
    }
  }, [isUpdateAvailable]);

  const handleUpdate = async () => {
    await update();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal to avoid showing again for a while
    localStorage.setItem('pwa-update-dismissed', Date.now().toString());
  };

  // Check if user recently dismissed
  useEffect(() => {
    if (!isUpdateAvailable) return;

    const dismissed = localStorage.getItem('pwa-update-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      
      // Don't show again for 1 hour
      if (hoursSinceDismissed < 1) {
        setShowPrompt(false);
      }
    }
  }, [isUpdateAvailable]);

  if (!showPrompt || !isUpdateAvailable) {
    return null;
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Update Available
          </DialogTitle>
          <DialogDescription>
            A new version of LEAP PM is available. Update now to get the latest features and improvements.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Later
          </Button>
          <Button
            onClick={handleUpdate}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
