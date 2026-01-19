'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Link } from '@/i18n/navigation';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageShareCardProps {
  message: {
    id: number;
    content: string;
    createdAt: string;
    sender?: {
      id: number;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    roomId?: string | number;
    roomName?: string;
  };
  className?: string;
}

export function ChatMessageShareCard({ message, className }: ChatMessageShareCardProps) {
  if (!message) return null;

  const senderName =
    message.sender?.firstName && message.sender?.lastName
      ? `${message.sender.firstName} ${message.sender.lastName}`
      : 'Unknown User';

  return (
    <Card
      className={cn(
        'bg-muted/30 border-border/50 rounded-lg overflow-hidden',
        'hover:bg-muted/40 transition-colors',
        className
      )}
    >
      <CardContent className="p-4">
        {/* Chat Context */}
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <MessageCircle className="h-3 w-3" />
          <span>
            {message.roomName ? `From ${message.roomName}` : 'From chat'}
          </span>
        </div>

        {/* Message Content */}
        <div className="space-y-3">
          {/* Sender Info */}
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 ring-1 ring-background">
              <AvatarImage src={message.sender?.avatar} />
              <AvatarFallback className="text-xs">
                {message.sender?.firstName?.[0] || ''}
                {message.sender?.lastName?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-foreground">
                  {senderName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          </div>

          {/* View Chat Link */}
          {message.roomId && (
            <div className="pt-3 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
              >
                <Link href={`/hub/chat?room=${message.roomId}`}>
                  View in chat
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
