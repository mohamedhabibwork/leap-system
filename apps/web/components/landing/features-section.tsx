'use client';

import { 
  BookOpen, 
  Users, 
  Award, 
  MessageCircle, 
  BarChart3, 
  Calendar,
  Briefcase,
  CreditCard,
  Video,
  Shield
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function FeaturesSection() {
  const t = useTranslations('landing.features');

  const features = [
    {
      icon: BookOpen,
      titleKey: 'items.courseManagement.title',
      descriptionKey: 'items.courseManagement.description',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      icon: Users,
      titleKey: 'items.socialLearning.title',
      descriptionKey: 'items.socialLearning.description',
      color: 'text-green-600 bg-green-100',
    },
    {
      icon: Award,
      titleKey: 'items.certificates.title',
      descriptionKey: 'items.certificates.description',
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      icon: MessageCircle,
      titleKey: 'items.chat.title',
      descriptionKey: 'items.chat.description',
      color: 'text-purple-600 bg-purple-100',
    },
    {
      icon: BarChart3,
      titleKey: 'items.analytics.title',
      descriptionKey: 'items.analytics.description',
      color: 'text-red-600 bg-red-100',
    },
    {
      icon: Calendar,
      titleKey: 'items.liveSessions.title',
      descriptionKey: 'items.liveSessions.description',
      color: 'text-orange-600 bg-orange-100',
    },
    {
      icon: Briefcase,
      titleKey: 'items.jobBoard.title',
      descriptionKey: 'items.jobBoard.description',
      color: 'text-indigo-600 bg-indigo-100',
    },
    {
      icon: CreditCard,
      titleKey: 'items.payments.title',
      descriptionKey: 'items.payments.description',
      color: 'text-pink-600 bg-pink-100',
    },
    {
      icon: Video,
      titleKey: 'items.richMedia.title',
      descriptionKey: 'items.richMedia.description',
      color: 'text-cyan-600 bg-cyan-100',
    },
    {
      icon: Shield,
      titleKey: 'items.security.title',
      descriptionKey: 'items.security.description',
      color: 'text-gray-700 bg-gray-100',
    },
  ];

  return (
    <div className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.titleKey}
                className="group p-6 rounded-2xl border-2 border-border hover:border-border/80 hover:shadow-xl transition-all duration-300 bg-card"
              >
                <div className="space-y-4">
                  <div className={`inline-flex p-3 rounded-xl ${feature.color} dark:opacity-80 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground">
                    {t(feature.titleKey as any)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(feature.descriptionKey as any)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
