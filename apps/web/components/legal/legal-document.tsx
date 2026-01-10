import { ReactNode } from 'react';

interface LegalDocumentProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalDocument({ title, lastUpdated, children }: LegalDocumentProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
        <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>
      </div>
      {children}
    </div>
  );
}

interface LegalSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 mb-12">
      <h2 className="text-2xl font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}
