import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Calendar, User, Clock, Share2, Bookmark, ThumbsUp } from 'lucide-react';
import { BlogCard } from '@/components/blog/blog-card';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import { blogAPI, type BlogPost } from '@/lib/api/blog';
import { format } from 'date-fns';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await blogAPI.getPostBySlug(slug);
    return {
      title: `${post.title} | Blog | LEAP PM`,
      description: post.excerpt || post.content.substring(0, 160),
      openGraph: {
        title: post.title,
        description: post.excerpt || post.content.substring(0, 160),
        images: post.thumbnailUrl ? [post.thumbnailUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: `Blog Post | LEAP PM`,
      description: 'Read our latest blog post',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let post: BlogPost;
  let relatedPosts: BlogPost[] = [];

  try {
    const [postData, relatedData] = await Promise.all([
      blogAPI.getPostBySlug(slug),
      blogAPI.getRelatedPosts(slug),
    ]);
    post = postData;
    relatedPosts = relatedData;
  } catch (error) {
    notFound();
  }

  const formattedDate = post.publishedAt 
    ? format(new Date(post.publishedAt), 'MMMM d, yyyy')
    : '';

  return (
    <>
      {/* Hero Section */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Badge */}
          {post.category && (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
              {post.category.name}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{formattedDate}</span>
            </div>
            {post.readTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{post.readTime}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pb-8 border-b border-border">
            <Button variant="outline" size="sm">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Like
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </article>

      {/* Featured Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
          {post.thumbnailUrl ? (
            <img 
              src={post.thumbnailUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-bold text-muted-foreground opacity-50">
                {post.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground hover:bg-muted/80 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Author Bio */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="p-8 rounded-2xl border border-border bg-card">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                {post.author.avatar ? (
                  <img 
                    src={post.author.avatar} 
                    alt={post.author.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {post.author.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {post.author.name}
              </h3>
              {post.author.bio && (
                <p className="text-muted-foreground leading-relaxed">
                  {post.author.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      <section className="py-20 bg-muted/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost, index) => (
              <BlogCard 
                key={relatedPost.slug} 
                title={relatedPost.title}
                slug={relatedPost.slug}
                author={relatedPost.author.name}
                date={relatedPost.publishedAt ? format(new Date(relatedPost.publishedAt), 'MMM d, yyyy') : ''}
                category={relatedPost.category.name}
                excerpt={relatedPost.excerpt || ''}
                readTime={relatedPost.readTime || ''}
                featuredImage={relatedPost.thumbnailUrl}
                index={index} 
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
