import Link from 'next/link';

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
      <h2 className="text-3xl font-extrabold text-gray-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm text-gray-600">
          {subtitle}{' '}
          {linkText && linkHref && (
            <Link href={linkHref} className="font-medium text-indigo-600 hover:text-indigo-500">
              {linkText}
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
