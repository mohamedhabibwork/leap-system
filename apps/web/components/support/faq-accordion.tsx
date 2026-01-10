'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollReveal } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  category?: string;
}

export function FAQAccordion({ items, category }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {category && (
        <h3 className="text-xl font-semibold text-foreground mb-6">{category}</h3>
      )}
      {items.map((item, index) => {
        const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
        const isOpen = openIndex === index;

        return (
          <div
            key={index}
            ref={ref}
            className={`rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 ${
              isOpen ? 'shadow-md' : ''
            } ${getScrollRevealClass(isVisible)}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-foreground pr-4">{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
