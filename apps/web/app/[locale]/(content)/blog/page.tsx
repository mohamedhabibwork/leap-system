import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { BlogCard } from '@/components/blog/blog-card';
import { FeaturedPost } from '@/components/blog/featured-post';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Blog | LEAP PM',
  description: 'Insights, tips, and stories from the LEAP PM community.',
};

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog');

  // Sample data - replace with actual API call
  const featuredPost = {
    title: 'The Future of Online Learning: Trends to Watch in 2024',
    excerpt: 'Explore the latest trends shaping the future of online education, from AI-powered personalization to immersive learning experiences.',
    author: 'Sarah Johnson',
    date: 'Jan 5, 2024',
    readTime: '8 min read',
    category: 'Industry Insights',
    slug: 'future-of-online-learning-2024',
  };

  const posts = [
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
    {
      title: 'The Role of Community in Online Learning',
      excerpt: 'Why building a strong learning community is essential for student success and engagement.',
      author: 'Jessica Martinez',
      date: 'Dec 18, 2023',
      readTime: '5 min read',
      category: 'Community',
      slug: 'role-of-community',
    },
    {
      title: 'Video Production Tips for Course Creators',
      excerpt: 'Professional video production techniques that will elevate the quality of your online courses.',
      author: 'Ryan Thompson',
      date: 'Dec 15, 2023',
      readTime: '9 min read',
      category: 'Production',
      slug: 'video-production-tips',
    },
    {
      title: 'Understanding Learning Analytics',
      excerpt: 'How to use data and analytics to improve your teaching and boost student outcomes.',
      author: 'Sarah Johnson',
      date: 'Dec 10, 2023',
      readTime: '8 min read',
      category: 'Analytics',
      slug: 'learning-analytics-guide',
    },
  ];

  const categories = ['All', 'Industry Insights', 'Teaching Tips', 'Career Advice', 'Student Success', 'Community', 'Production', 'Analytics'];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              className="pl-12 pr-4 py-6 text-lg rounded-xl border-2"
            />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedPost {...featuredPost} />
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-background border-y border-border sticky top-20 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'All' ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <BlogCard key={post.slug} {...post} index={index} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-12">
            <Button variant="outline" size="sm">{t('pagination.previous')}</Button>
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">{t('pagination.next')}</Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-foreground text-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('newsletter.title')}
          </h2>
          <p className="text-lg opacity-80 mb-8">
            {t('newsletter.description')}
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder={t('newsletter.emailPlaceholder')}
              className="flex-1 bg-background text-foreground"
            />
            <Button type="submit" variant="secondary">
              {t('newsletter.subscribe')}
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
