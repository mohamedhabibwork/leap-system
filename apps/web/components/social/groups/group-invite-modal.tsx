'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Search } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface GroupInviteModalProps {
  groupId: number;
  trigger?: React.ReactNode;
}

export function GroupInviteModal({ groupId, trigger }: GroupInviteModalProps) {
  const t = useTranslations('groups');
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const queryClient = useQueryClient();

  // Mock connections query - replace with real API
  const { data, isLoading } = useQuery({
    queryKey: ['connections', searchQuery],
    queryFn: async () => {
      // Mock data
      return {
        data: [
          {
            id: 10,
            firstName: 'Charlie',
            lastName: 'Brown',
            avatar: null,
            headline: 'Software Developer',
          },
          {
            id: 11,
            firstName: 'Diana',
            lastName: 'Prince',
            avatar: null,
            headline: 'Product Manager',
          },
          {
            id: 12,
            firstName: 'Eve',
            lastName: 'Wilson',
            avatar: null,
            headline: 'UX Designer',
          },
        ],
      };
    },
    enabled: open,
  });

  const inviteMutation = useMutation({
    mutationFn: async (userIds: number[]) => {
      // API call to invite users
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success(t('invitesSent'));
      setOpen(false);
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
    },
    onError: () => {
      toast.error(t('invitesFailed'));
    },
  });

  const handleToggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleInvite = () => {
    if (selectedUsers.length === 0) {
      toast.error(t('selectUsersToInvite'));
      return;
    }
    inviteMutation.mutate(selectedUsers);
  };

  const connections = data?.data || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="h-4 w-4 me-2" />
            {t('inviteMembers')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('inviteMembersTitle')}</DialogTitle>
          <DialogDescription>{t('inviteMembersDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchConnections')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10"
            />
          </div>

          {/* User List */}
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {isLoading ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                {t('loading')}
              </p>
            ) : connections.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                {t('noConnectionsFound')}
              </p>
            ) : (
              connections.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleToggleUser(user.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {user.firstName} {user.lastName}
                    </p>
                    {user.headline && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.headline}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleInvite}
              disabled={selectedUsers.length === 0 || inviteMutation.isPending}
            >
              {t('sendInvites')} ({selectedUsers.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
