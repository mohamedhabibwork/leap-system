'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2 } from 'lucide-react';
import { chatAPI, ChatRoom } from '@/lib/api/chat';
import { useChatStore } from '@/stores/chat.store';
import { cn } from '@/lib/utils';

interface User {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
}

export function NewChatDialog({
  open,
  onOpenChange,
  onChatCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated?: (room: ChatRoom) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { createRoom, addRoom } = useChatStore();

  useEffect(() => {
    if (open && searchQuery.trim()) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery, open]);

  const searchUsers = async () => {
    setIsLoading(true);
    try {
      const results = await chatAPI.searchUsers(searchQuery);
      setUsers(results);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    setIsCreating(true);
    try {
      const participantIds = selectedUsers.map((u) => u.id);
      const room = await createRoom({ participantIds });

      if (room) {
        onChatCreated?.(room);
        onOpenChange(false);
        setSelectedUsers([]);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
          <DialogDescription>
            Search for users to start a conversation with
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full"
                >
                  <span className="text-sm">{user.name}</span>
                  <button
                    onClick={() => handleUserSelect(user)}
                    className="text-primary hover:text-primary/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* User List */}
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchQuery.trim()
                    ? 'No users found'
                    : 'Start typing to search for users'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => {
                  const isSelected = selectedUsers.find((u) => u.id === user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left',
                        isSelected && 'bg-accent'
                      )}
                    >
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs text-primary-foreground">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateChat}
              disabled={selectedUsers.length === 0 || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Start Chat'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
