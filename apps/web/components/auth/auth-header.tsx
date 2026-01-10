import { Link } from '@/i18n/navigation';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
  linkLabel?: string;
}

export function AuthHeader({ title, subtitle, linkText, linkHref, linkLabel }: AuthHeaderProps) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-extrabold text-card-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground">
          {subtitle}{' '}
          {linkText && linkHref && (
            <Link href={linkHref} className="font-medium text-primary hover:text-primary/80">
              {linkText}
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
