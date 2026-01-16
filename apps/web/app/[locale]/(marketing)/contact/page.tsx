import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { ContactForm } from '@/components/forms/contact-form';

export const metadata: Metadata = {
  title: 'Contact Us | LEAP PM',
  description: 'Get in touch with the LEAP PM team. We\'re here to help with any questions or concerns.',
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('marketing.contact');

  const contactInfo = [
    {
      icon: Mail,
      title: t('contactInfo.email.title'),
      details: ['support@leappm.com', 'sales@leappm.com'],
      description: t('contactInfo.email.description'),
    },
    {
      icon: Phone,
      title: t('contactInfo.phone.title'),
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
      description: t('contactInfo.phone.description'),
    },
    {
      icon: MapPin,
      title: t('contactInfo.visit.title'),
      details: ['123 Innovation Drive', 'San Francisco, CA 94105'],
      description: t('contactInfo.visit.description'),
    },
    {
      icon: Clock,
      title: t('contactInfo.hours.title'),
      details: [t('contactInfo.hours.weekdays'), t('contactInfo.hours.weekend')],
      description: t('contactInfo.hours.description'),
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {t('hero.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.title}
                  className="p-6 rounded-2xl border border-border bg-card text-center"
                >
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-border/50 mb-4">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      {detail}
                    </p>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('form.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('form.description')}
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-border bg-card">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('faq.description')}
          </p>
          <a
            href="/faq"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium"
          >
            {t('faq.button')}
          </a>
        </div>
      </section>
    </>
  );
}
