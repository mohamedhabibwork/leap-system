'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';
import { ChatRoomList } from './ChatRoomList';
import { ChatWindow } from './ChatWindow';
import { NewChatDialog } from './NewChatDialog';
import { cn } from '@/lib/utils';
import { useChatSocket } from '@/lib/hooks/use-chat-socket';
import { useSession } from 'next-auth/react';

export function ChatSidebar() {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { activeRoom, loadRooms, setActiveRoom } = useChatStore();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken && isOpen) {
      loadRooms();
    }
  }, [session, isOpen, loadRooms]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 end-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          aria-label={t('openChat')}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'fixed bottom-4 end-4 z-50 flex flex-col shadow-2xl transition-all duration-300',
        isMinimized
          ? 'w-80 h-16'
          : 'w-96 h-[600px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-semibold text-start">{t('messages')}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 flex overflow-hidden">
          {activeRoom ? (
            <ChatWindow onBack={() => setActiveRoom(null)} />
          ) : (
            <ChatRoomList onStartNewChat={() => {}} />
          )}
        </div>
      )}
    </Card>
  );
}
