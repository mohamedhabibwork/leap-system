'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Check, 
  X 
} from 'lucide-react';
import { useChatStore } from '@/stores/chat.store';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useChatSocket } from '@/lib/hooks/use-chat-socket';
import { useChatMessages } from '@/lib/hooks/use-chat-messages';
import { useSession } from 'next-auth/react';
import { ChatAttachment, MessageAttachment } from './ChatAttachment';
import { AvatarOnlineIndicator } from './OnlineIndicator';
import { ReadReceipts } from './ReadReceipts';
import { usePresence } from '@/lib/hooks/use-presence';

interface ChatWindowProps {
  onBack: () => void;
}

export function ChatWindow({ onBack }: ChatWindowProps) {
  const t = useTranslations('chat');
  const [messageInput, setMessageInput] = useState('');
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevScrollHeightRef = useRef<number>(0);

  const { activeRoom, rooms, typingUsers } = useChatStore();
  const { data: session } = useSession();
  const { 
    isConnected, 
    joinRoom, 
    sendMessage: sendSocketMessage, 
    startTyping, 
    stopTyping 
  } = useChatSocket();
  
  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMore,
    hasMoreMessages,
    isLoadingMore,
  } = useChatMessages(activeRoom);

  const { isUserOnline } = usePresence();
  
  const activeRoomData = rooms.find((room) => room.id === activeRoom);
  const currentUserId = (session?.user as any)?.id;
  
  // Get the other participant's ID for direct chats (2 participants)
  const otherParticipantId = activeRoomData?.participants?.length === 2
    ? activeRoomData.participants.find(id => id !== currentUserId)
    : undefined;
  const isOtherUserOnline = otherParticipantId ? isUserOnline(otherParticipantId) : false;

  // Get typing users for this room (excluding current user)
  const roomTypingUsers = activeRoom 
    ? (typingUsers[activeRoom] || []).filter(id => id !== currentUserId) 
    : [];

  // Join room when connected
  useEffect(() => {
    if (activeRoom && isConnected) {
      joinRoom(activeRoom);
    }
  }, [activeRoom, isConnected, joinRoom]);

  // Scroll to bottom when messages change (only for new messages, not when loading older)
  useEffect(() => {
    if (scrollRef.current && !isLoadingMore) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isLoadingMore]);

  // Maintain scroll position when loading older messages
  useEffect(() => {
    if (scrollRef.current && isLoadingMore) {
      const newScrollHeight = scrollRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
      scrollRef.current.scrollTop += scrollDiff;
    }
  }, [isLoadingMore, messages]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle scroll for infinite loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    
    // Load more when scrolled near the top
    if (target.scrollTop < 100 && hasMoreMessages && !isLoadingMore) {
      prevScrollHeightRef.current = target.scrollHeight;
      loadMore();
    }
  }, [hasMoreMessages, isLoadingMore, loadMore]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !pendingAttachment) || !activeRoom || isSending) return;

    const content = messageInput.trim() || (pendingAttachment ? '' : '');
    const userId = currentUserId || 1;

    // Send via socket if connected
    if (isConnected) {
      sendSocketMessage({
        roomId: activeRoom,
        content,
        userId,
        attachmentUrl: pendingAttachment || undefined,
        timestamp: new Date().toISOString(),
      });
    }

    // Also send via REST API for persistence
    sendMessage({ roomId: activeRoom, content, attachmentUrl: pendingAttachment || undefined });

    setMessageInput('');
    setPendingAttachment(null);
    setIsTypingLocal(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isConnected && activeRoom) {
      stopTyping(activeRoom, userId);
    }
  }, [messageInput, pendingAttachment, activeRoom, isSending, currentUserId, isConnected, sendSocketMessage, sendMessage, stopTyping]);

  const handleTyping = useCallback(() => {
    if (!activeRoom || !isConnected) return;

    const userId = currentUserId || 1;

    if (!isTypingLocal) {
      setIsTypingLocal(true);
      startTyping(activeRoom, userId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      stopTyping(activeRoom, userId);
    }, 2000);
  }, [activeRoom, isConnected, currentUserId, isTypingLocal, startTyping, stopTyping]);

  const handleBlur = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setIsTypingLocal(false);
    if (isConnected && activeRoom && currentUserId) {
      stopTyping(activeRoom, currentUserId);
    }
  }, [isConnected, activeRoom, currentUserId, stopTyping]);

  const handleStartEdit = useCallback((messageId: number, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditContent('');
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingMessageId || !editContent.trim()) return;
    
    editMessage({ messageId: editingMessageId, content: editContent.trim() });
    setEditingMessageId(null);
    setEditContent('');
  }, [editingMessageId, editContent, editMessage]);

  const handleDelete = useCallback((messageId: number) => {
    if (confirm(t('confirmDeleteMessage'))) {
      deleteMessage(messageId);
    }
  }, [deleteMessage, t]);

  const handleAttachment = useCallback((url: string) => {
    setPendingAttachment(url);
  }, []);

  if (!activeRoomData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground text-start">{t('roomNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 rtl-flip" />
        </Button>
        <div className="relative">
          <Avatar>
            <AvatarImage src={undefined} />
            <AvatarFallback>
              {activeRoomData.name?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          {otherParticipantId && (
            <AvatarOnlineIndicator 
              userId={otherParticipantId}
              isOnline={isOtherUserOnline}
              size="md"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {activeRoomData.name || `Chat ${activeRoomData.id}`}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 text-start">
            {otherParticipantId ? (
              isOtherUserOnline ? (
                <span className="text-green-600">{t('online')}</span>
              ) : (
                <span>{t('offline')}</span>
              )
            ) : (
              isConnected ? t('connected') : t('connecting')
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea 
        className="flex-1 p-4" 
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {/* Load more button */}
        {hasMoreMessages && !isLoadingMore && (
          <div className="flex justify-center py-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadMore}
              className="text-xs text-muted-foreground"
            >
              {t('loadOlderMessages')}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;
              const isEditingThis = editingMessageId === msg.id;
              
              return (
                <div
                  key={msg.id}
                  className={cn('flex group', isOwn ? 'justify-end' : 'justify-start')}
                >
                  <div className={cn(
                    'flex items-end gap-2 max-w-[80%]',
                    isOwn && 'flex-row-reverse'
                  )}>
                    <div
                      className={cn(
                        'rounded-lg p-3 relative',
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {isEditingThis ? (
                        <div className="space-y-2">
                          <Input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="bg-background text-foreground"
                            autoFocus
                          />
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={handleSaveEdit}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Attachment */}
                          {msg.attachmentUrl && (
                            <MessageAttachment url={msg.attachmentUrl} className="mb-2" />
                          )}
                          
                          {/* Message content */}
                          {msg.content && (
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          )}
                          
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {format(new Date(msg.createdAt), 'h:mm a')}
                            </span>
                            {msg.isEdited && (
                              <span className="text-xs opacity-50">(edited)</span>
                            )}
                            {isOwn && (
                              <ReadReceipts 
                                messageId={msg.id} 
                                isOwn={isOwn}
                                participantCount={activeRoomData?.participants?.length || 2}
                                className="ms-1"
                              />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Message actions (only for own messages) */}
                    {isOwn && !isEditingThis && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                          <DropdownMenuItem onClick={() => handleStartEdit(msg.id, msg.content)}>
                            <Edit2 className="h-4 w-4 me-2" />
                            {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(msg.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 me-2" />
                            {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing indicator */}
          {roomTypingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground italic text-start">
                    {roomTypingUsers.length === 1 
                      ? t('someoneTyping')
                      : t('multipleTyping', { count: roomTypingUsers.length })
                    }
                  </span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Pending attachment preview */}
      {pendingAttachment && (
        <div className="px-3 py-2 border-t bg-muted/50">
          <div className="flex items-center gap-2">
            <MessageAttachment url={pendingAttachment} className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setPendingAttachment(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t">
        <div className="flex gap-2">
          <ChatAttachment onAttach={handleAttachment} disabled={isSending} />
          <Input
            placeholder={t('typeMessage')}
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              if (e.target.value) {
                handleTyping();
              }
            }}
            onBlur={handleBlur}
            className="flex-1"
            disabled={isSending}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={(!messageInput.trim() && !pendingAttachment) || isSending}
          >
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
