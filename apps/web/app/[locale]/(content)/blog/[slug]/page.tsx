import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Calendar, User, Clock, Share2, Bookmark, ThumbsUp } from 'lucide-react';
import { BlogCard } from '@/components/blog/blog-card';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  // TODO: Fetch post data for metadata
  return {
    title: `Blog Post | LEAP PM`,
    description: 'Read our latest blog post',
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // TODO: Fetch actual blog post data
  // For now, using sample data
  const post = {
    title: 'The Future of Online Learning: Trends to Watch in 2024',
    excerpt: 'Explore the latest trends shaping the future of online education, from AI-powered personalization to immersive learning experiences.',
    author: 'Sarah Johnson',
    authorBio: 'Sarah is the CEO and Co-Founder of LEAP PM. She has over 15 years of experience in EdTech and is passionate about making quality education accessible to everyone.',
    date: 'January 5, 2024',
    readTime: '8 min read',
    category: 'Industry Insights',
    tags: ['Education', 'Technology', 'AI', 'Future'],
  };

  const relatedPosts = [
    {
      title: '10 Tips for Creating Engaging Online Courses',
      excerpt: 'Learn proven strategies to keep your students engaged and motivated throughout your course.',
      author: 'Michael Chen',
      date: 'Jan 3, 2024',
      readTime: '6 min read',
      category: 'Teaching Tips',
      slug: '10-tips-engaging-courses',
    },
    {
      title: 'How to Build a Successful Career as an Online Instructor',
      excerpt: 'Discover the steps to establish yourself as a successful online educator and grow your teaching business.',
      author: 'Emily Rodriguez',
      date: 'Dec 28, 2023',
      readTime: '10 min read',
      category: 'Career Advice',
      slug: 'career-online-instructor',
    },
    {
      title: 'Maximizing Student Retention in Online Courses',
      excerpt: 'Effective techniques to improve course completion rates and keep students coming back for more.',
      author: 'David Park',
      date: 'Dec 22, 2023',
      readTime: '7 min read',
      category: 'Student Success',
      slug: 'student-retention-strategies',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
            {post.category}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{post.readTime}</span>
            </div>
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
          {/* Placeholder for featured image */}
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-muted-foreground opacity-50">
              {post.title.charAt(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Sample Content */}
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            The landscape of online education is evolving at an unprecedented pace. As we move into 2024, several key trends are emerging that promise to reshape how we learn, teach, and interact with educational content.
          </p>

          <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">
            AI-Powered Personalization
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Artificial Intelligence is revolutionizing the way we approach online learning. By analyzing student behavior, learning patterns, and performance data, AI systems can now create truly personalized learning experiences. This means each student receives content tailored to their learning style, pace, and preferences.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Adaptive learning platforms are becoming increasingly sophisticated, adjusting difficulty levels in real-time and suggesting supplementary materials based on individual needs. This level of personalization was once the exclusive domain of one-on-one tutoring but is now accessible to millions of learners worldwide.
          </p>

          <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">
            Immersive Learning Experiences
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Virtual Reality (VR) and Augmented Reality (AR) are moving from experimental to mainstream in online education. These technologies enable students to practice skills in realistic simulations, explore historical sites, or visualize complex concepts in three dimensions.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Medical students can perform virtual surgeries, architecture students can walk through their designs, and language learners can practice conversations in immersive environments. The possibilities are endless, and the technology is becoming more accessible every day.
          </p>

          <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">
            Community-Driven Learning
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The importance of community in online learning cannot be overstated. Platforms are increasingly focusing on features that foster peer-to-peer interaction, collaborative projects, and social learning. Discussion forums, study groups, and live sessions are becoming integral parts of the online learning experience.
          </p>

          <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">
            Micro-Credentials and Skill-Based Learning
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The traditional four-year degree is no longer the only path to career success. Micro-credentials, digital badges, and skill-based certifications are gaining recognition from employers. These shorter, focused learning paths allow professionals to quickly acquire specific skills and demonstrate their competencies.
          </p>

          <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">
            Conclusion
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            As we look ahead, it's clear that online learning is not just a temporary solution but a permanent part of our educational landscape. The trends we're seeing today—AI personalization, immersive technologies, strong communities, and flexible credentials—are shaping a future where quality education is more accessible, engaging, and effective than ever before.
          </p>
        </div>

        {/* Tags */}
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
      </div>

      {/* Author Bio */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="p-8 rounded-2xl border border-border bg-card">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">
                  {post.author.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {post.author}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {post.authorBio}
              </p>
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
              <BlogCard key={relatedPost.slug} {...relatedPost} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
