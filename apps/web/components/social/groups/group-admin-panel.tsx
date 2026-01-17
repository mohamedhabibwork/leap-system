'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Users,
  UserPlus,
  Shield,
  Ban,
  Check,
  X,
  Crown,
  Trash2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGroupMembers } from '@/lib/hooks/use-api';
import apiClient from '@/lib/api/client';

interface GroupAdminPanelProps {
  groupId: number;
  isAdmin: boolean;
}

export function GroupAdminPanel({ groupId, isAdmin }: GroupAdminPanelProps) {
  const t = useTranslations('groups');
  const [activeTab, setActiveTab] = useState('members');

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t('admin.title')}
        </CardTitle>
        <CardDescription>{t('admin.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">{t('admin.members')}</TabsTrigger>
            <TabsTrigger value="requests">{t('admin.requests')}</TabsTrigger>
            <TabsTrigger value="settings">{t('admin.settings')}</TabsTrigger>
            <TabsTrigger value="moderation">{t('admin.moderation')}</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <MemberManagement groupId={groupId} />
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <JoinRequestsManagement groupId={groupId} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <GroupSettings groupId={groupId} />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <ModerationPanel groupId={groupId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Member Management Component
function MemberManagement({ groupId }: { groupId: number }) {
  const t = useTranslations('groups');
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real members from API
  const { data: membersData } = useGroupMembers(groupId, { search: searchQuery });
  
  const members = (membersData?.data || []).map((member: any) => ({
    id: member.id || member.userId,
    firstName: member.firstName || member.user?.firstName || '',
    lastName: member.lastName || member.user?.lastName || '',
    avatar: member.avatar || member.user?.avatar || null,
    role: member.role || 'member',
    joinedAt: member.joinedAt || member.createdAt || new Date().toISOString(),
  }));

  const promoteMutation = useMutation({
    mutationFn: async (memberId: number) => {
      return apiClient.post(`/social/groups/${groupId}/members/${memberId}/promote`);
    },
    onSuccess: () => {
      toast.success(t('admin.memberPromoted'));
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
    },
  });

  const demoteMutation = useMutation({
    mutationFn: async (memberId: number) => {
      return apiClient.post(`/social/groups/${groupId}/members/${memberId}/demote`);
    },
    onSuccess: () => {
      toast.success(t('admin.memberDemoted'));
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: number) => {
      return apiClient.delete(`/social/groups/${groupId}/members/${memberId}`);
    },
    onSuccess: () => {
      toast.success(t('admin.memberRemoved'));
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
    },
  });

  const handlePromoteToModerator = (memberId: number) => {
    promoteMutation.mutate(memberId);
  };

  const handleDemoteFromModerator = (memberId: number) => {
    demoteMutation.mutate(memberId);
  };

  const handleRemoveMember = (memberId: number) => {
    if (window.confirm(t('admin.confirmRemoveMember'))) {
      removeMutation.mutate(memberId);
    }
  };

  const filteredMembers = members.filter((member) =>
    `${member.firstName} ${member.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <Input
          placeholder={t('admin.searchMembers')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Member List */}
      <div className="space-y-3">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.avatar || undefined} />
                <AvatarFallback>
                  {member.firstName[0]}
                  {member.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={
                  member.role === 'admin'
                    ? 'default'
                    : member.role === 'moderator'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {member.role === 'admin' && <Crown className="h-3 w-3 me-1" />}
                {member.role === 'moderator' && <Shield className="h-3 w-3 me-1" />}
                {member.role}
              </Badge>

              {member.role === 'member' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePromoteToModerator(member.id)}
                >
                  {t('admin.makeModerator')}
                </Button>
              )}

              {member.role === 'moderator' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDemoteFromModerator(member.id)}
                >
                  {t('admin.removeModerator')}
                </Button>
              )}

              {member.role !== 'admin' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Join Requests Management
function JoinRequestsManagement({ groupId }: { groupId: number }) {
  const t = useTranslations('groups');
  const queryClient = useQueryClient();

  // Fetch real join requests from API
  const { data: requestsData } = useQuery({
    queryKey: ['group-join-requests', groupId],
    queryFn: () => apiClient.get(`/social/groups/${groupId}/join-requests`).then(res => res.data),
  });

  const requests = (requestsData?.data || []).map((request: any) => ({
    id: request.id,
    userId: request.userId || request.user?.id,
    firstName: request.user?.firstName || request.firstName || '',
    lastName: request.user?.lastName || request.lastName || '',
    avatar: request.user?.avatar || request.avatar || null,
    requestedAt: request.createdAt || request.requestedAt || new Date().toISOString(),
    message: request.message || request.note || '',
  }));

  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return apiClient.post(`/social/groups/${groupId}/join-requests/${requestId}/approve`);
    },
    onSuccess: () => {
      toast.success(t('admin.requestApproved'));
      queryClient.invalidateQueries({ queryKey: ['group-join-requests', groupId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return apiClient.post(`/social/groups/${groupId}/join-requests/${requestId}/reject`);
    },
    onSuccess: () => {
      toast.success(t('admin.requestRejected'));
      queryClient.invalidateQueries({ queryKey: ['group-join-requests', groupId] });
    },
  });

  const handleApprove = (requestId: number) => {
    approveMutation.mutate(requestId);
  };

  const handleReject = (requestId: number) => {
    rejectMutation.mutate(requestId);
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('admin.noJoinRequests')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={request.avatar || undefined} />
                  <AvatarFallback>
                    {request.firstName[0]}
                    {request.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {request.firstName} {request.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                  {request.message && (
                    <p className="text-sm text-muted-foreground mt-2">
                      "{request.message}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleApprove(request.id)}>
                  <Check className="h-4 w-4 me-2" />
                  {t('admin.approve')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(request.id)}
                >
                  <X className="h-4 w-4 me-2" />
                  {t('admin.reject')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Group Settings
function GroupSettings({ groupId }: { groupId: number }) {
  const t = useTranslations('groups');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);

  const handleSave = () => {
    // API call to update group settings
    toast.success(t('admin.settingsSaved'));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="group-name">{t('admin.groupName')}</Label>
        <Input
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('admin.groupNamePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="group-description">{t('admin.description')}</Label>
        <Textarea
          id="group-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('admin.descriptionPlaceholder')}
          rows={4}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('admin.publicGroup')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('admin.publicGroupDescription')}
            </p>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('admin.requireApproval')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('admin.requireApprovalDescription')}
            </p>
          </div>
          <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
        </div>
      </div>

      <Button onClick={handleSave}>{t('admin.saveChanges')}</Button>
    </div>
  );
}

// Moderation Panel
function ModerationPanel({ groupId }: { groupId: number }) {
  const t = useTranslations('groups');
  const queryClient = useQueryClient();

  // Fetch real banned users from API
  const { data: bannedUsersData } = useQuery({
    queryKey: ['group-banned-users', groupId],
    queryFn: () => apiClient.get(`/social/groups/${groupId}/banned-users`).then(res => res.data),
  });

  const bannedUsers = (bannedUsersData?.data || []).map((user: any) => ({
    id: user.id || getUserId(user),
    firstName: user.firstName || user.user?.firstName || '',
    lastName: user.lastName || user.user?.lastName || '',
    avatar: user.avatar || user.user?.avatar || null,
    bannedAt: user.bannedAt || user.createdAt || new Date().toISOString(),
    reason: user.reason || user.banReason || '',
  }));

  const unbanMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiClient.post(`/social/groups/${groupId}/banned-users/${userId}/unban`);
    },
    onSuccess: () => {
      toast.success(t('admin.userUnbanned'));
      queryClient.invalidateQueries({ queryKey: ['group-banned-users', groupId] });
    },
  });

  const handleUnban = (userId: number) => {
    unbanMutation.mutate(userId);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">{t('admin.bannedUsers')}</h4>
        {bannedUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('admin.noBannedUsers')}</p>
        ) : (
          <div className="space-y-2">
            {bannedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Banned: {user.reason}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleUnban(user.id)}>
                  {t('admin.unban')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
