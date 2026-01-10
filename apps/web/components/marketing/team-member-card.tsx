'use client';

import { Linkedin, Twitter, Mail } from 'lucide-react';
import { useScrollReveal } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

interface TeamMemberCardProps {
  name: string;
  role: string;
  bio: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  index?: number;
}

export function TeamMemberCard({
  name,
  role,
  bio,
  image,
  linkedin,
  twitter,
  email,
  index = 0,
}: TeamMemberCardProps) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`group ${getScrollRevealClass(isVisible)}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300">
        {/* Avatar */}
        <div className="mb-4 relative overflow-hidden rounded-xl aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-bold text-muted-foreground">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{role}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
        </div>

        {/* Social Links */}
        {(linkedin || twitter || email) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {twitter && (
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
