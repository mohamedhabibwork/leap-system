'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandList, CommandGroup, CommandItem } from '@/components/ui/command';
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

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange?: (mentionIds: number[]) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  autoFocus?: boolean;
}

export function MentionTextarea({
  value,
  onChange,
  onMentionsChange,
  placeholder,
  className,
  rows = 4,
  autoFocus = false,
}: MentionTextareaProps) {
  const t = useTranslations('common.create.post');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);

  // Extract mention IDs from content
  const extractMentions = useCallback((text: string): number[] => {
    const mentionRegex = /@\[(\d+)\]/g;
    const matches = Array.from(text.matchAll(mentionRegex));
    return matches.map(m => parseInt(m[1], 10));
  }, []);

  // Update mention IDs when content changes
  useEffect(() => {
    if (onMentionsChange) {
      const mentionIds = extractMentions(value);
      onMentionsChange(mentionIds);
    }
  }, [value, extractMentions, onMentionsChange]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 1) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchAPI.searchUsers(query, { limit: 10 });
      const results = Array.isArray(response) ? response : response?.data || [];
      setUsers(results);
    } catch (error) {
      console.error('Failed to search users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email || 'Unknown';
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Check if we're typing after an @ symbol
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Check if there's a space or newline after @ (meaning mention is complete)
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const hasSpaceOrNewline = /[\s\n]/.test(textAfterAt);
      const hasClosingBracket = textAfterAt.includes(']');
      
      if (!hasSpaceOrNewline && !hasClosingBracket) {
        // We're in a mention context
        const query = textAfterAt;
        setMentionQuery(query);
        setMentionStartIndex(lastAtIndex);
        setShowMentions(true);
        setSelectedUserIndex(0);
        
        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
          searchUsers(query);
        }, 300);
        
        // Update position for dropdown
        setTimeout(() => updateMentionPosition(), 0);
        
        onChange(newValue);
        return;
      }
    }
    
    // Not in mention context
    setShowMentions(false);
    setMentionQuery('');
    setMentionStartIndex(null);
    onChange(newValue);
  };

  const updateMentionPosition = useCallback(() => {
    if (!textareaRef.current || mentionStartIndex === null) return;

    const textarea = textareaRef.current;
    const rect = textarea.getBoundingClientRect();
    
    // Get cursor position
    const textBeforeMention = value.substring(0, mentionStartIndex);
    const lines = textBeforeMention.split('\n');
    const currentLine = lines.length - 1;
    
    // Estimate line height (default to 20px if not available)
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 8;
    
    // Calculate approximate position
    setMentionPosition({
      top: rect.top + paddingTop + (currentLine * lineHeight) + lineHeight + 5,
      left: rect.left + 10,
    });
  }, [value, mentionStartIndex]);

  const insertMention = (user: User) => {
    if (mentionStartIndex === null || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBefore = value.substring(0, mentionStartIndex);
    // Get text after the @ symbol up to cursor
    const textAfterAt = value.substring(mentionStartIndex + 1, cursorPosition);
    // Get remaining text after cursor
    const textAfter = value.substring(cursorPosition);
    const mentionText = `@[${user.id}](${getUserDisplayName(user)})`;
    
    const newValue = textBefore + mentionText + ' ' + textAfter;
    onChange(newValue);
    
    setShowMentions(false);
    setMentionQuery('');
    setMentionStartIndex(null);
    
    // Set cursor position after mention
    setTimeout(() => {
      const newCursorPos = textBefore.length + mentionText.length + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && users.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedUserIndex((prev) => 
          prev < users.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedUserIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(users[selectedUserIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
        setMentionQuery('');
        setMentionStartIndex(null);
      }
    }
  };

  useEffect(() => {
    if (showMentions && mentionStartIndex !== null) {
      updateMentionPosition();
    }
  }, [showMentions, mentionStartIndex, value, updateMentionPosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={cn("resize-none", className)}
        autoFocus={autoFocus}
      />
      
      {showMentions && users.length > 0 && (
        <div
          className="absolute z-50 w-[300px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          style={{
            position: 'fixed',
            top: `${mentionPosition.top}px`,
            left: `${mentionPosition.left}px`,
            maxHeight: '200px',
            overflow: 'auto',
          }}
        >
          <Command>
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {t('searchingUsers', { defaultValue: 'Searching users...' })}
                </div>
              ) : users.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {mentionQuery.length < 1
                    ? t('typeToSearch', { defaultValue: 'Type to search users' })
                    : t('noUsersFound', { defaultValue: 'No users found' })}
                </div>
              ) : (
                <CommandGroup>
                  {users.map((user, index) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => insertMention(user)}
                      className={cn(
                        "cursor-pointer",
                        index === selectedUserIndex && "bg-accent"
                      )}
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
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
