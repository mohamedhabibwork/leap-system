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

  // Mock data - replace with real API calls
  const members = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
      role: 'admin',
      joinedAt: '2024-01-15',
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      avatar: null,
      role: 'moderator',
      joinedAt: '2024-01-20',
    },
    {
      id: 3,
      firstName: 'Bob',
      lastName: 'Johnson',
      avatar: null,
      role: 'member',
      joinedAt: '2024-02-01',
    },
  ];

  const handlePromoteToModerator = (memberId: number) => {
    // API call to promote member
    toast.success(t('admin.memberPromoted'));
  };

  const handleDemoteFromModerator = (memberId: number) => {
    // API call to demote moderator
    toast.success(t('admin.memberDemoted'));
  };

  const handleRemoveMember = (memberId: number) => {
    if (window.confirm(t('admin.confirmRemoveMember'))) {
      // API call to remove member
      toast.success(t('admin.memberRemoved'));
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

  // Mock data
  const requests = [
    {
      id: 1,
      userId: 10,
      firstName: 'Alice',
      lastName: 'Brown',
      avatar: null,
      requestedAt: '2024-03-10',
      message: 'I would like to join this group to learn more about the topic.',
    },
    {
      id: 2,
      userId: 11,
      firstName: 'Charlie',
      lastName: 'Wilson',
      avatar: null,
      requestedAt: '2024-03-11',
    },
  ];

  const handleApprove = (requestId: number) => {
    // API call
    toast.success(t('admin.requestApproved'));
  };

  const handleReject = (requestId: number) => {
    // API call
    toast.success(t('admin.requestRejected'));
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

  // Mock banned users
  const bannedUsers = [
    {
      id: 1,
      firstName: 'Spammer',
      lastName: 'User',
      avatar: null,
      bannedAt: '2024-03-01',
      reason: 'Posting spam content',
    },
  ];

  const handleUnban = (userId: number) => {
    // API call
    toast.success(t('admin.userUnbanned'));
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
