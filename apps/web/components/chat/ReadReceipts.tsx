'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, CheckCheck, Eye } from 'lucide-react';
import { chatAPI, MessageReadReceipt } from '@/lib/api/chat';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReadReceiptsProps {
  messageId: number;
  isOwn: boolean;
  participantCount?: number;
  className?: string;
}

/**
 * Component to show read receipts for a message
 * Shows checkmarks for sent/delivered/read status and who has read the message
 */
export function ReadReceipts({ 
  messageId, 
  isOwn, 
  participantCount = 2,
  className 
}: ReadReceiptsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch read receipts when popover is opened
  const { data: readReceipts = [], isLoading } = useQuery({
    queryKey: ['chat', 'reads', messageId],
    queryFn: () => chatAPI.getMessageReads(messageId),
    enabled: isOpen && isOwn, // Only fetch for own messages when opened
    staleTime: 30 * 1000, // Cache for 30 seconds
  });

  // For non-own messages, don't show read receipts
  if (!isOwn) {
    return null;
  }

  const readCount = readReceipts.length;
  const allRead = readCount >= participantCount - 1; // -1 for sender

  return (
    <div className={cn('inline-flex items-center', className)}>
      {/* Simple checkmarks for quick view */}
      {readCount === 0 ? (
        <Check className="h-3 w-3 text-muted-foreground/50" />
      ) : allRead ? (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center hover:opacity-80">
              <CheckCheck className="h-3 w-3 text-primary" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <ReadReceiptsList receipts={readReceipts} isLoading={isLoading} />
          </PopoverContent>
        </Popover>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center hover:opacity-80">
              <CheckCheck className="h-3 w-3 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <ReadReceiptsList receipts={readReceipts} isLoading={isLoading} />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

interface ReadReceiptsListProps {
  receipts: MessageReadReceipt[];
  isLoading: boolean;
}

function ReadReceiptsList({ receipts, isLoading }: ReadReceiptsListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-2 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-2 text-sm text-muted-foreground">
        No one has read this message yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
        <Eye className="h-3 w-3" />
        Read by {receipts.length} {receipts.length === 1 ? 'person' : 'people'}
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {receipts.map((receipt) => (
          <div key={receipt.userId} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={receipt.user?.avatar} />
              <AvatarFallback className="text-xs">
                {receipt.user?.firstName?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {receipt.user?.firstName} {receipt.user?.lastName}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {format(new Date(receipt.readAt), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Simple read status indicator without click interaction
 */
export function ReadStatusIndicator({ 
  isRead, 
  isDelivered = true,
  className 
}: { 
  isRead: boolean;
  isDelivered?: boolean;
  className?: string;
}) {
  if (isRead) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <CheckCheck className={cn('h-3 w-3 text-primary', className)} />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Read</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isDelivered) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <CheckCheck className={cn('h-3 w-3 text-muted-foreground', className)} />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Delivered</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Check className={cn('h-3 w-3 text-muted-foreground/50', className)} />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Sent</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
