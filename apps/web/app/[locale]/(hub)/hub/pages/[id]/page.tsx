'use client';

import { use } from 'react';
import { usePageById, usePagePosts } from '@/lib/hooks/use-api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Heart, 
  CheckCircle2, 
  Settings,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import Image from 'next/image';
import { CardSkeleton } from '@/components/loading/card-skeleton';
import { CreatePost } from '@/components/shared/create-post';

interface PageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PageDetailPage({ params }: PageDetailPageProps) {
  const { id } = use(params);
  const pageId = parseInt(id);
  const { data: page, isLoading: pageLoading } = usePageById(pageId);
  const { data: posts, isLoading: postsLoading } = usePagePosts(pageId);

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={1} />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  const isOwner = page.isOwned; // Assuming this field exists

  return (
    <div className="space-y-6">
      {/* Cover & Profile Section */}
      <Card className="overflow-hidden">
        {/* Cover Image */}
        {page.coverImage ? (
          <div className="relative w-full h-48 md:h-64">
            <Image
              src={page.coverImage}
              alt={page.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 md:h-64 bg-gradient-to-br from-primary/20 to-primary/5" />
        )}

        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-start">{page.name}</h1>
                {page.isVerified && (
                  <CheckCircle2 className="h-6 w-6 text-blue-500" />
                )}
              </div>

              {page.category && (
                <Badge variant="secondary" className="mb-3">
                  {page.category}
                </Badge>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{page.followerCount || 0} followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{page.likeCount || 0} likes</span>
                </div>
              </div>

              {page.description && (
                <p className="text-muted-foreground text-start">{page.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOwner ? (
                <Button variant="outline">
                  <Settings className="me-2 h-4 w-4" />
                  Manage Page
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant={page.isFollowing ? 'outline' : 'default'}>
                    {page.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6 mt-6">
          {isOwner && (
            <CreatePost
              context="page"
              contextId={pageId}
              placeholder="Share something on your page..."
            />
          )}

          {postsLoading ? (
            <CardSkeleton count={3} />
          ) : posts && posts.length > 0 ? (
            <div className="space-y-4">
              {/* Render posts here - reuse post card component */}
              {posts.map((post: any) => (
                <Card key={post.id}>
                  <CardHeader>
                    <p className="text-start">{post.content}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-start">About</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-start">Description</h4>
                <p className="text-muted-foreground text-start">
                  {page.description || 'No description available'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-start">Category</h4>
                <p className="text-muted-foreground text-start">
                  {page.category || 'Uncategorized'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Photos coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Events coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
