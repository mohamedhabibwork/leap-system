'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  TrendingUp,
  CheckCircle2,
  Users,
  Heart,
} from 'lucide-react';
import { CreatePageModal } from '@/components/modals';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function MyPagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletePageId, setDeletePageId] = useState<number | null>(null);

  // Mock data - replace with real API calls
  const pages = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      description: 'Innovative technology solutions for modern businesses',
      category: 'Business',
      followerCount: 845,
      likeCount: 234,
      postCount: 67,
      isVerified: true,
      coverImage: null,
    },
    {
      id: 2,
      name: 'Creative Design Studio',
      description: 'Where creativity meets functionality',
      category: 'Brand',
      followerCount: 523,
      likeCount: 189,
      postCount: 45,
      isVerified: false,
      coverImage: null,
    },
  ];

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFollowers = pages.reduce((sum, p) => sum + p.followerCount, 0);
  const totalLikes = pages.reduce((sum, p) => sum + p.likeCount, 0);
  const totalPosts = pages.reduce((sum, p) => sum + p.postCount, 0);

  const handleDelete = async (pageId: number) => {
    try {
      // Call delete API
      toast.success('Page deleted successfully');
      setDeletePageId(null);
    } catch (error) {
      toast.error('Failed to delete page');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-start">My Pages</h1>
          <p className="text-muted-foreground mt-2 text-start">
            Manage your pages and track performance
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="me-2 h-4 w-4" />
          Create Page
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Total Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{pages.length}</div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              {pages.filter(p => p.isVerified).length} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{totalFollowers}</div>
            <p className="text-xs text-green-600 text-start mt-1">
              ↑ 12% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{totalLikes}</div>
            <p className="text-xs text-green-600 text-start mt-1">
              ↑ 8% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-start">Total Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-start">{totalPosts}</div>
            <p className="text-xs text-muted-foreground text-start mt-1">
              Avg {pages.length > 0 ? Math.round(totalPosts / pages.length) : 0} per page
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-10 text-start"
        />
      </div>

      {/* Pages Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredPages.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pages found</p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="me-2 h-4 w-4" />
                Create Your First Page
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPages.map((page) => (
            <Card key={page.id} className="overflow-hidden">
              {/* Cover Image */}
              {page.coverImage ? (
                <div className="relative w-full h-40">
                  <Image
                    src={page.coverImage}
                    alt={page.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5" />
              )}

              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link href={`/hub/pages/${page.id}`}>
                      <h3 className="font-semibold text-xl truncate hover:underline text-start">
                        {page.name}
                        {page.isVerified && (
                          <CheckCircle2 className="inline h-5 w-5 text-blue-500 ms-1" />
                        )}
                      </h3>
                    </Link>
                    <Badge variant="secondary" className="mt-2">
                      {page.category}
                    </Badge>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="me-2 h-4 w-4" />
                        Edit Page
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="me-2 h-4 w-4" />
                        Page Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrendingUp className="me-2 h-4 w-4" />
                        View Insights
                      </DropdownMenuItem>
                      {!page.isVerified && (
                        <DropdownMenuItem>
                          <CheckCircle2 className="me-2 h-4 w-4" />
                          Request Verification
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeletePageId(page.id)}
                      >
                        <Trash2 className="me-2 h-4 w-4" />
                        Delete Page
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {page.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 text-start mt-2">
                    {page.description}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-start">{page.followerCount}</div>
                    <div className="text-xs text-muted-foreground text-start">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-start">{page.likeCount}</div>
                    <div className="text-xs text-muted-foreground text-start">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-start">{page.postCount}</div>
                    <div className="text-xs text-muted-foreground text-start">Posts</div>
                  </div>
                </div>

                <Link href={`/hub/pages/${page.id}`}>
                  <Button variant="outline" className="w-full">
                    Manage Page
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <CreatePageModal open={showCreateModal} onOpenChange={setShowCreateModal} />

      {/* Delete Confirmation */}
      <AlertDialog open={deletePageId !== null} onOpenChange={() => setDeletePageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">Delete Page</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              Are you sure you want to delete this page? All followers and content will be lost and
              this action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePageId && handleDelete(deletePageId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
