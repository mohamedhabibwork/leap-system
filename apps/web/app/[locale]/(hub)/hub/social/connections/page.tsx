'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import { ConnectionRequestCard } from '@/components/social/connections/connection-request-card';
import { ConnectionButton } from '@/components/social/connections/connection-button';
import { Users, UserPlus, Clock, Search } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useConnectionStats, usePendingConnectionRequests, useConnections, useConnectionSuggestions } from '@/hooks/use-connections';

export default function MyNetworkPage() {
  const t = useTranslations('connections');
  const [searchQuery, setSearchQuery] = useState('');

  // Get connection stats
  const { data: stats } = useConnectionStats();

  // Get pending requests
  const { data: pendingRequestsData, isLoading: isLoadingRequests } = usePendingConnectionRequests(50);

  // Get connections
  const { data: connectionsData, isLoading: isLoadingConnections } = useConnections({ searchQuery, limit: 50 });

  // Get suggestions
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useConnectionSuggestions(10);

  const pendingRequests = pendingRequestsData?.data || [];
  const connections = connectionsData?.data || [];
  const suggestions = suggestionsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('myNetwork')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('networkDescription')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">{t('connections')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalConnections || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-base">{t('pendingRequests')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.pendingRequests || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">{t('sentRequests')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.sentRequests || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="connections">
            {t('myConnections')} ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            {t('requests')} ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            {t('suggestions')}
          </TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
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

          {/* Connections List */}
          {isLoadingConnections ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : connections.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? t('noConnectionsFound') : t('noConnections')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((connection) => {
                const user = connection.user;
                if (!user) return null;

                return (
                  <Card key={connection.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Link href={`/hub/users/${user.id}`}>
                          <Avatar className="h-16 w-16 ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                            <AvatarFallback>
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/hub/users/${user.id}`}
                            className="font-semibold hover:underline inline-flex items-center gap-2"
                          >
                            {user.firstName} {user.lastName}
                          </Link>
                          {user.role && (
                            <Badge variant="secondary" className="ms-2 text-xs">
                              {user.role}
                            </Badge>
                          )}

                          {user.bio && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {user.bio}
                            </p>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/hub/chat?user=${user.id}`}>
                                {t('message')}
                              </Link>
                            </Button>
                            <ConnectionButton userId={user.id} variant="ghost" size="sm" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {isLoadingRequests ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('noPendingRequests')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <ConnectionRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          {isLoadingSuggestions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('noSuggestions')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion) => {
                const user = suggestion.user;
                if (!user) return null;

                return (
                  <Card key={suggestion.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Link href={`/hub/users/${user.id}`}>
                          <Avatar className="h-16 w-16 ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                            <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                            <AvatarFallback>
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/hub/users/${user.id}`}
                            className="font-semibold hover:underline"
                          >
                            {user.firstName} {user.lastName}
                          </Link>
                          {user.role && (
                            <Badge variant="secondary" className="ms-2 text-xs">
                              {user.role}
                            </Badge>
                          )}

                          {user.bio && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {user.bio}
                            </p>
                          )}

                          <div className="mt-3">
                            <ConnectionButton userId={user.id} size="sm" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
