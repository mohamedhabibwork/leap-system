import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Search, HelpCircle, BookOpen, MessageCircle } from 'lucide-react';

export default async function SupportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LEAP PM
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/help" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <HelpCircle className="h-4 w-4" />
                Help Center
              </Link>
              <Link href="/faq" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-4 w-4" />
                FAQ
              </Link>
              <Link href="/docs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <BookOpen className="h-4 w-4" />
                Docs
              </Link>
              <Link href="/contact" className="text-foreground font-medium hover:text-blue-600 transition-colors">
                Contact Support
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
                <li><Link href="/docs" className="text-muted-foreground hover:text-foreground">Documentation</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-muted-foreground hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Connect</h3>
              <p className="text-sm text-muted-foreground mb-2">support@leappm.com</p>
              <p className="text-sm text-muted-foreground">Available 24/7</p>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
            <p>© {new Date().getFullYear()} LEAP PM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
