import { Link } from '@/i18n/navigation';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NotFound() {
  const popularPages = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/hub/courses' },
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-6">
            <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              404
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for content..."
              className="pl-12 pr-4 py-6 rounded-xl border-2"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg">
            <Link href="/" className="inline-flex items-center gap-2">
              <Home className="h-5 w-5" />
              Go to Homepage
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <button onClick={() => window.history.back()} className="inline-flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>
          </Button>
        </div>

        {/* Popular Pages */}
        <div className="pt-8 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Popular Pages
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {popularPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm text-foreground transition-colors"
              >
                {page.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Report Link */}
        <div className="mt-8">
          <Link href="/contact" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Report a broken link
          </Link>
        </div>
      </div>
    </div>
  );
}
