'use client';

import { use, useState } from 'react';
import { useInfinitePosts } from '@/lib/hooks/use-api';
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

export default function GroupDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState('posts');

  // Mock group data - replace with actual API call
  const group = {
    id: parseInt(id),
    name: 'Web Development Enthusiasts',
    description: 'A community for web developers to share knowledge, projects, and tips.',
    coverImage: '/group-cover.jpg',
    memberCount: 1234,
    privacy: 'public' as const,
    isJoined: false,
    members: [],
  };

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isLoading: postsLoading,
  } = useInfinitePosts({ groupId: id });

  const posts = postsData?.pages.flatMap((page: any) => page.data) || [];

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <Card>
        <div className="relative h-48">
          {group.coverImage ? (
            <Image
              src={group.coverImage}
              alt={group.name}
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
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  {group.privacy === 'private' ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  <span className="capitalize">{group.privacy} group</span>
                </div>
                <span>•</span>
                <span>{group.memberCount.toLocaleString()} members</span>
              </div>
              <p className="mt-3 text-muted-foreground">{group.description}</p>
            </div>

            <div className="flex gap-2">
              <ShareButton
                entityType="group"
                entityId={group.id}
                url={`/hub/social/groups/${group.id}`}
                title={group.name}
              />
              <JoinButton
                entityType="group"
                entityId={group.id}
                isJoined={group.isJoined}
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
          {group.isJoined && (
            <CreatePost
              context="group"
              contextId={group.id}
              placeholder="Share something with the group..."
            />
          )}

          {postsLoading ? (
            <FeedSkeleton count={3} />
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.members.map((member: any) => (
              <UserCard key={member.id} user={member} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">About this group</h3>
            <p className="text-muted-foreground">{group.description}</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
