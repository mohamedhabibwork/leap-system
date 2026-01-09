import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className = '' }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className={`max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl ${className}`}>
        {children}
      </Card>
    </div>
  );
}
