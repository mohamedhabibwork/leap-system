'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { NewChatDialog } from './NewChatDialog';

export function ChatRoomList({ onStartNewChat }: { onStartNewChat?: () => void }) {
  const t = useTranslations('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const { rooms, activeRoom, setActiveRoom, isLoading, loadRooms } = useChatStore();

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const filteredRooms = rooms.filter((room) =>
    room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.participants.some(() => true) // Simple filter for now
  );

  const handleRoomClick = (roomId: string) => {
    setActiveRoom(roomId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search and New Chat */}
      <div className="p-3 border-b space-y-2">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchConversations')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowNewChatDialog(true)}
        >
          <Plus className="h-4 w-4 me-2" />
          {t('newChat')}
        </Button>
      </div>

      {/* Room List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">{t('noConversations')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewChatDialog(true)}
            >
              {t('startNewChat')}
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-start',
                  activeRoom === room.id && 'bg-accent'
                )}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src="/avatar-placeholder.png" />
                    <AvatarFallback>
                      {room.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {room.unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {room.unreadCount}
                    </Badge>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm truncate">
                      {room.name || `Chat ${room.id}`}
                    </p>
                    {room.lastMessageAt && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ms-2">
                        {format(new Date(room.lastMessageAt), 'h:mm a')}
                      </span>
                    )}
                  </div>
                  {room.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {room.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      <NewChatDialog
        open={showNewChatDialog}
        onOpenChange={setShowNewChatDialog}
        onChatCreated={(room) => {
          setShowNewChatDialog(false);
          setActiveRoom(room.id);
        }}
      />
    </div>
  );
}
