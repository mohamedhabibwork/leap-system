'use client';

import { useScrollReveal, useInView } from '@/lib/hooks/use-scroll-animation';
import { getScrollRevealClass } from '@/lib/utils/animation-variants';

interface Milestone {
  year: string;
  title: string;
  description: string;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  return (
    <div className="space-y-0">
      {milestones.map((milestone, index) => {
        const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
        const [lineRef, lineVisible] = useInView<HTMLDivElement>({ threshold: 0.5 });
        const isLast = index === milestones.length - 1;

        return (
          <div
            key={milestone.year}
            ref={ref}
            className={`relative ${getScrollRevealClass(isVisible)}`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex gap-6 md:gap-8">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                {/* Year Badge */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                  <span className="text-sm font-bold">{milestone.year}</span>
                </div>
                
                {/* Connecting Line */}
                {!isLast && (
                  <div 
                    ref={lineRef}
                    className="w-0.5 h-full min-h-[100px] mt-2 bg-gradient-to-b from-blue-300 to-purple-300 dark:from-blue-700 dark:to-purple-700 relative overflow-hidden"
                  >
                    <div 
                      className="absolute inset-0 bg-gradient-to-b from-blue-600 to-purple-600 transition-transform duration-1000 origin-top"
                      style={{
                        transform: lineVisible ? 'scaleY(1)' : 'scaleY(0)',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-12">
                <div className="p-6 rounded-2xl border border-border bg-card">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
