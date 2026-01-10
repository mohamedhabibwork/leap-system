'use client';

import { use, useState } from 'react';
import { useInfinitePosts, useGroup, useGroupMembers } from '@/lib/hooks/use-api';
import { CreatePost } from '@/components/shared/create-post';
import { PageLoader } from '@/components/loading/page-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCard } from '@/components/cards/user-card';
import { JoinButton } from '@/components/buttons/join-button';
import { ShareButton } from '@/components/buttons/share-button';
import { Users, Lock, Globe } from 'lucide-react';
import Image from 'next/image';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FeedSkeleton } from '@/components/loading/feed-skeleton';

export default function GroupDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const groupId = parseInt(id);
  const [activeTab, setActiveTab] = useState('posts');

  const { data: group, isLoading: isGroupLoading, error: groupError } = useGroup(groupId);
  const { data: membersResponse, isLoading: isMembersLoading } = useGroupMembers(groupId);
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isLoading: postsLoading,
  } = useInfinitePosts({ groupId: groupId });

  const posts = postsData?.pages.flatMap((page: any) => page.data) || [];
  const members = membersResponse?.data || [];

  if (isGroupLoading) {
    return <PageLoader message="Loading group..." />;
  }

  if (groupError || !group) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6">
          <p className="text-destructive">Group not found or failed to load.</p>
        </Card>
      </div>
    );
  }

  const getPrivacyIcon = (privacyId: number) => {
    // Assuming privacyId: 1=public, 2=private
    return privacyId === 2 ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />;
  };

  const getPrivacyLabel = (privacyId: number) => {
    return privacyId === 2 ? 'private' : 'public';
  };

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <Card>
        <div className="relative h-48">
          {group.coverImageUrl ? (
            <Image
              src={group.coverImageUrl}
              alt={group.nameEn || group.nameAr || 'Group'}
              fill
              className="object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Users className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{group.nameEn || group.nameAr || 'Unnamed Group'}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  {getPrivacyIcon(group.privacyId)}
                  <span className="capitalize">{getPrivacyLabel(group.privacyId)} group</span>
                </div>
                <span>•</span>
                <span>{(group.membersCount || 0).toLocaleString()} members</span>
              </div>
              <p className="mt-3 text-muted-foreground">{group.descriptionEn || group.descriptionAr || 'No description available'}</p>
            </div>

            <div className="flex gap-2">
              <ShareButton
                entityType="group"
                entityId={group.id}
                url={`/hub/social/groups/${group.id}`}
                title={group.nameEn || group.nameAr || 'Group'}
              />
              <JoinButton
                entityType="group"
                entityId={group.id}
                isJoined={false}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Group Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6 space-y-6">
          <CreatePost
            context="group"
            contextId={group.id}
            placeholder="Share something with the group..."
          />

          {postsLoading ? (
            <FeedSkeleton count={3} />
          ) : posts.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">No posts yet. Be the first to post!</p>
            </Card>
          ) : (
            <InfiniteScroll
              dataLength={posts.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={<FeedSkeleton count={1} />}
              endMessage={
                <p className="text-center text-muted-foreground py-4">
                  No more posts
                </p>
              }
            >
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <Card key={post.id} className="p-4">
                    <p>{post.content}</p>
                  </Card>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          {isMembersLoading ? (
            <PageLoader message="Loading members..." />
          ) : members.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">No members to display</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member: any) => (
                <UserCard key={member.id} user={member} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">About this group</h3>
            <p className="text-muted-foreground">{group.descriptionEn || group.descriptionAr || 'No description available'}</p>
            
            <div className="mt-6 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(group.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="font-medium">{(group.membersCount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posts</p>
                <p className="font-medium">{(group.postsCount || 0).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
