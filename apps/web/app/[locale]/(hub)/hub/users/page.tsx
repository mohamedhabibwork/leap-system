'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useUsersDirectory } from '@/hooks/use-users-directory';

interface User {
  id: number;
  uuid: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  roleId: number;
  isOnline: boolean;
}

import { useTranslations } from 'next-intl';

export default function UserDirectoryPage() {
  const t = useTranslations('directory');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, totalPages } = useUsersDirectory({
    searchQuery,
    roleFilter,
    page,
    limit,
  });

  const getRoleBadge = (roleId: number) => {
    const roles: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      1: { label: tCommon('roles.admin', { defaultValue: 'Admin' }), variant: 'destructive' },
      2: { label: tCommon('roles.instructor', { defaultValue: 'Instructor' }), variant: 'default' },
      3: { label: tCommon('roles.student', { defaultValue: 'Student' }), variant: 'secondary' },
    };
    return roles[roleId] || { label: tCommon('roles.user', { defaultValue: 'User' }), variant: 'secondary' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('findUsers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('allRoles')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('allRoles')}</SelectItem>
                <SelectItem value="2">{t('instructors')}</SelectItem>
                <SelectItem value="3">{t('students')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.map((user: User) => {
              const roleBadge = getRoleBadge(user.roleId);
              const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.username[0].toUpperCase();
              const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;

              return (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src={user.avatarUrl} alt={fullName} />
                          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      <div className="space-y-1 w-full">
                        <h3 className="font-semibold text-lg truncate">{fullName}</h3>
                        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                        <Badge variant={roleBadge.variant} className="mt-2">
                          {roleBadge.label}
                        </Badge>
                      </div>

                      {user.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                      )}

                      <Link href={`/hub/users/${user.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          {t('viewProfile')}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {data?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">{t('noUsersFound')}</p>
              </CardContent>
            </Card>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {tCommon('actions.previous', { defaultValue: 'Previous' })}
              </Button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm text-muted-foreground">
                  {t('page', { current: page, total: totalPages })}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {tCommon('actions.next', { defaultValue: 'Next' })}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
