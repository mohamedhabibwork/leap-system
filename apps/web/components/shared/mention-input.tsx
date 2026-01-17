'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X } from 'lucide-react';
import { searchAPI } from '@/lib/api/search';
import { cn } from '@/lib/utils';

interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

interface MentionInputProps {
  value: number[];
  onChange: (userIds: number[]) => void;
  placeholder?: string;
  className?: string;
}

export function MentionInput({
  value,
  onChange,
  placeholder = "Mention people...",
  className,
}: MentionInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch selected users data when value changes
  useEffect(() => {
    const fetchSelectedUsers = async () => {
      if (value.length === 0) {
        setSelectedUsers([]);
        return;
      }

      try {
        // Fetch user details for selected IDs
        const userPromises = value.map(async (userId) => {
          try {
            const response = await searchAPI.searchUsers('', { limit: 100 });
            const allUsers = Array.isArray(response) ? response : response?.data || [];
            return allUsers.find((u: any) => u.id === userId);
          } catch {
            return null;
          }
        });
        const fetchedUsers = (await Promise.all(userPromises)).filter(Boolean) as User[];
        setSelectedUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch selected users:', error);
      }
    };

    fetchSelectedUsers();
  }, [value]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchAPI.searchUsers(query, { limit: 10 });
      const results = Array.isArray(response) ? response : response?.data || [];
      // Filter out already selected users
      const filtered = results.filter((user: User) => !value.includes(user.id));
      setUsers(filtered);
    } catch (error) {
      console.error('Failed to search users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, open, searchUsers]);

  const handleUserSelect = (user: User) => {
    if (!value.includes(user.id)) {
      const newValue = [...value, user.id];
      onChange(newValue);
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveUser = (userId: number) => {
    const newValue = value.filter(id => id !== userId);
    onChange(newValue);
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email || 'Unknown';
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Users Chips */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-full text-sm"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {getUserDisplayName(user)[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{getUserDisplayName(user)}</span>
              <button
                type="button"
                onClick={() => handleRemoveUser(user.id)}
                className="ml-1 hover:text-destructive transition-colors"
                aria-label={`Remove ${getUserDisplayName(user)}`}
                title={`Remove ${getUserDisplayName(user)}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim().length >= 2) {
                setOpen(true);
              } else {
                setOpen(false);
              }
            }}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) {
                setOpen(true);
              }
            }}
            className="w-full"
          />
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search users..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Searching...' : searchQuery.length < 2 ? 'Type at least 2 characters' : 'No users found'}
              </CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleUserSelect(user)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>
                          {getUserDisplayName(user)[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {getUserDisplayName(user)}
                        </p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
