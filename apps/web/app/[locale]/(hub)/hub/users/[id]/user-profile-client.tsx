'use client';

import { use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePublicProfile } from '@/lib/hooks/use-profile';
import { Loader2, Mail, MapPin, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfileClient({ params }: PageProps) {
  const { id } = use(params);
  const userId = parseInt(id);
  const { data: user, isLoading } = usePublicProfile(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
        <p className="mt-2 text-gray-600">This user profile doesn't exist or has been removed.</p>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;

  const getRoleBadge = (roleId: number) => {
    const roles: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      1: { label: 'Admin', variant: 'destructive' },
      2: { label: 'Instructor', variant: 'default' },
      3: { label: 'Student', variant: 'secondary' },
    };
    return roles[roleId] || { label: 'User', variant: 'secondary' };
  };

  const roleBadge = getRoleBadge(user.roleId);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src={user.avatarUrl} alt={fullName} />
              <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
                  <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                  {user.isOnline && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Online
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600">@{user.username}</p>
              </div>

              {user.bio && (
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
                </div>
                {user.lastSeenAt && !user.isOnline && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Last seen {format(new Date(user.lastSeenAt), 'PPp')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline">Follow</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Contact via platform messaging</span>
            </div>
            {user.timezone && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{user.timezone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Courses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Certificates</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {user.roleId === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Courses Taught</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No courses available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
