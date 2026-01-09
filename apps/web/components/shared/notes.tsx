'use client';

import { useState } from 'react';
import { useNotes } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pin, Heart, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface NotesProps {
  entityType: string;
  entityId: number;
}

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private (Only Me)', color: 'bg-gray-500' },
  { value: 'public', label: 'Public', color: 'bg-green-500' },
  { value: 'instructors', label: 'Instructors Only', color: 'bg-blue-500' },
];

export function Notes({ entityType, entityId }: NotesProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [visibility, setVisibility] = useState('private');
  const { data: notes, isLoading } = useNotes(entityType, entityId);

  const handleCreate = async () => {
    if (!newNote.trim()) return;

    try {
      // API call to create note
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Note created!');
      setNewNote('');
      setIsCreating(false);
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  if (isLoading) {
    return <div>Loading notes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Notes ({notes?.length || 0})</h3>
        <Button size="sm" onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      {/* Create Note Form */}
      {isCreating && (
        <Card className="p-4">
          <div className="space-y-3">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note..."
              rows={4}
            />
            <div className="flex items-center justify-between">
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!newNote.trim()}>
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes?.map((note: any) => (
          <Card
            key={note.id}
            className={`p-4 border-l-4 ${
              VISIBILITY_OPTIONS.find((v) => v.value === note.visibility)?.color
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {note.isPinned && <Pin className="h-4 w-4 text-primary" />}
                  <Badge variant="outline">
                    {VISIBILITY_OPTIONS.find((v) => v.value === note.visibility)?.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(note.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                {note.visibility === 'public' && (
                  <div className="mt-2 flex items-center gap-4">
                    <Button variant="ghost" size="sm">
                      <Heart className="mr-1 h-3 w-3" />
                      {note.likeCount || 0}
                    </Button>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    {note.isPinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Change Visibility</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
