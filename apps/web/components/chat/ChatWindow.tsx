'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useChatSocket } from '@/lib/hooks/use-chat-socket';
import { useSession } from 'next-auth/react';

export function ChatWindow({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { activeRoom, rooms, messages, addMessage, setMessages, isSending, loadMessages } =
    useChatStore();
  const { data: session } = useSession();
  const socket = socketClient.getChatSocket();

  const activeRoomData = rooms.find((room) => room.id === activeRoom);

  useEffect(() => {
    if (activeRoom) {
      loadMessages(activeRoom);
    }
  }, [activeRoom, loadMessages]);

  useEffect(() => {
    if (activeRoom && isConnected) {
      // Join the room using the hook
      joinRoom(activeRoom);
    }
  }, [activeRoom, isConnected, joinRoom]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeRoom || !isConnected || isSending) return;

    const messageContent = message.trim();
    const userId = (session?.user as any)?.id || 1;

    // Send via socket hook
    const sent = sendSocketMessage({
      roomId: activeRoom,
      content: messageContent,
      userId,
      timestamp: new Date().toISOString(),
    });

    if (sent) {
      // Optimistically add message
      addMessage({
        id: Date.now(),
        roomId: activeRoom,
        senderId: userId,
        content: messageContent,
        createdAt: new Date().toISOString(),
      });

      setMessage('');
      setIsTyping(false);

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      // Stop typing indicator
      stopTyping(activeRoom, userId);
    }
  };

  const handleTyping = () => {
    if (!activeRoom || !socket) return;

    const userId = (session?.user as any)?.id || 1;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing:start', {
        roomId: activeRoom,
        userId,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing:stop', {
        roomId: activeRoom,
        userId,
      });
    }, 1000);
  };

  if (!activeRoomData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Room not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar>
          <AvatarImage src="/avatar-placeholder.png" />
          <AvatarFallback>
            {activeRoomData.name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {activeRoomData.name || `Chat ${activeRoomData.id}`}
          </h3>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages
            .filter((msg) => msg.roomId === activeRoom)
            .map((msg) => {
              const isOwn = msg.senderId === (session?.user as any)?.id;
              return (
                <div
                  key={msg.id}
                  className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg p-3',
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onBlur={() => {
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              setIsTyping(false);
              if (isConnected && activeRoom) {
                stopTyping(activeRoom, (session?.user as any)?.id || 1);
              }
            }}
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={!message.trim() || isSending}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
