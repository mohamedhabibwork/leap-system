import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface ActionButton {
  label: string;
  href: string;
  variant?: 'default' | 'outline' | 'ghost';
}

interface ErrorPageBaseProps {
  errorCode: number | string;
  title: string;
  description: string;
  illustration?: React.ReactNode;
  actionButtons?: ActionButton[];
  className?: string;
}

export function ErrorPageBase({
  errorCode,
  title,
  description,
  illustration,
  actionButtons = [],
  className = '',
}: ErrorPageBaseProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${className}`}>
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center">
        {/* Illustration */}
        {illustration && (
          <div className="mb-8 flex justify-center">
            {illustration}
          </div>
        )}

        {/* Error Code */}
        <div className="mb-4">
          <span className="text-8xl md:text-9xl font-bold text-muted-foreground/20">
            {errorCode}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {title}
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          {description}
        </p>

        {/* Action Buttons */}
        {actionButtons.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {actionButtons.map((button, index) => (
              <Link key={index} href={button.href}>
                <Button 
                  variant={button.variant || 'default'}
                  size="lg"
                  className="min-w-[150px]"
                >
                  {button.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
