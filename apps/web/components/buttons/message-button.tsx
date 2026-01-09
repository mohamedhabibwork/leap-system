'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface MessageButtonProps {
  userId: number;
  userName: string;
  isOnline?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function MessageButton({ userId, userName, isOnline, size = 'sm' }: MessageButtonProps) {
  const router = useRouter();

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to chat with specific user
    router.push(`/hub/chat?userId=${userId}`);
  };

  return (
    <div className="relative">
      <Button variant="outline" size={size} onClick={handleMessage}>
        <MessageCircle className="mr-2 h-4 w-4" />
        Message
      </Button>
      {isOnline && (
        <Badge
          variant="default"
          className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-green-500"
        />
      )}
    </div>
  );
}
