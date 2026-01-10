'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { NoMessages } from '@/components/empty/no-messages';
import { Send, Search, Smile, Paperclip } from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';
import { useSocketStore } from '@/stores/socket.store';
import { useChatMessages, useChatRooms } from '@/lib/hooks/use-chat-messages';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { AnalyticsEvents } from '@/lib/firebase/analytics';

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const { activeRoom, setActiveRoom, typingUsers } = useChatStore();
  const { chatSocket } = useSocketStore();
  const { data: session } = useSession();
  
  // Use TanStack Query for rooms
  const { rooms = [], isLoading: roomsLoading } = useChatRooms();
  
  // Use TanStack Query for messages
  const { messages = [], sendMessage, isSending } = useChatMessages(activeRoom);

  const filteredRooms = rooms.filter((room: any) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRoomData = rooms.find((room: any) => room.id === activeRoom);

  // Get typing status for active room
  const currentTypingUsers = activeRoom ? typingUsers[activeRoom] || [] : [];
  const typingText = currentTypingUsers.length > 0 
    ? `User ${currentTypingUsers[0]} is typing...` 
    : null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    // Track message send
    try {
      AnalyticsEvents.sendMessage('direct');
    } catch (analyticsError) {
      // Silently fail analytics
    }

    // Send message using mutation (handles both API and WebSocket)
    sendMessage({
      roomId: activeRoom,
      content: newMessage,
    });

    setNewMessage('');
  };

  const handleTyping = () => {
    if (chatSocket && activeRoom) {
      chatSocket.emit('typing:start', {
        roomId: activeRoom,
        userId: (session?.user as any)?.id || 1,
      });
    }
  };

  const handleStopTyping = () => {
    if (chatSocket && activeRoom) {
      chatSocket.emit('typing:stop', {
        roomId: activeRoom,
        userId: (session?.user as any)?.id || 1,
      });
    }
  };

  if (roomsLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (rooms.length === 0) {
    return <NoMessages />;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Chat Room List */}
      <Card className="w-80 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  setActiveRoom(room.id);
                  // Track chat room selection
                  try {
                    AnalyticsEvents.startChat('room');
                  } catch (analyticsError) {
                    // Silently fail analytics
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left',
                  activeRoom === room.id && 'bg-accent'
                )}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src="/avatar-placeholder.png" />
                    <AvatarFallback>{room.name?.[0] || 'C'}</AvatarFallback>
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
                    <p className="font-semibold text-sm truncate">{room.name}</p>
                    {room.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(room.lastMessage.createdAt), 'h:mm a')}
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
        </ScrollArea>
      </Card>

      {/* Chat Window */}
      {activeRoom && activeRoomData ? (
        <Card className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/avatar-placeholder.png" />
              <AvatarFallback>{activeRoomData.name?.[0] || 'C'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{activeRoomData.name || 'Chat Room'}</h3>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.senderId === 1 ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg p-3',
                      message.senderId === 1
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {format(new Date(message.createdAt), 'h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="icon">
                <Smile className="h-5 w-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (e.target.value) {
                    handleTyping();
                  } else {
                    handleStopTyping();
                  }
                }}
                onBlur={handleStopTyping}
                className="flex-1"
              />
              {typingText && (
                <span className="text-xs text-muted-foreground italic">{typingText}</span>
              )}
              <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="flex-1 flex items-center justify-center text-muted-foreground">
          Select a conversation to start messaging
        </Card>
      )}
    </div>
  );
}
