'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hook to detect if an element is in viewport
 * @param options - Intersection Observer options
 * @returns ref to attach to element and boolean indicating if element is in view
 */
export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = {}
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, {
      threshold: 0.1,
      ...options,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return [ref, isInView];
}

/**
 * Hook for scroll reveal animations
 * Triggers animation when element comes into view
 * @param options - Intersection Observer options
 * @returns ref to attach to element and boolean indicating if animation should trigger
 */
export function useScrollReveal<T extends HTMLElement>(
  options: IntersectionObserverInit = {}
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated, options.threshold, options.rootMargin]);

  return [ref, hasAnimated];
}

/**
 * Hook for parallax scrolling effect
 * @param speed - Parallax speed multiplier (0.5 = half speed, 2 = double speed)
 * @returns ref to attach to element and transform value
 */
export function useParallax<T extends HTMLElement>(
  speed: number = 0.5
): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let rafId: number;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementHeight = rect.height;
        const viewportHeight = window.innerHeight;

        // Only calculate parallax when element is in or near viewport
        if (scrollY + viewportHeight > elementTop && scrollY < elementTop + elementHeight) {
          const relativeScroll = scrollY - elementTop + viewportHeight;
          const parallaxOffset = relativeScroll * speed;
          setOffset(parallaxOffset);
        }

        lastScrollY = scrollY;
      });
    };

    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return [ref, offset];
}

/**
 * Hook to track scroll progress
 * @returns scroll progress as percentage (0-100)
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const scrollableHeight = documentHeight - windowHeight;
        const scrolled = (scrollTop / scrollableHeight) * 100;
        setProgress(Math.min(Math.max(scrolled, 0), 100));
      });
    };

    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return progress;
}

/**
 * Hook to detect scroll direction
 * @returns 'up' | 'down' | null
 */
export function useScrollDirection(): 'up' | 'down' | null {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        
        if (scrollY > lastScrollY.current && scrollY > 50) {
          setDirection('down');
        } else if (scrollY < lastScrollY.current) {
          setDirection('up');
        }

        lastScrollY.current = scrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return direction;
}

/**
 * Hook for counter animation
 * @param end - End value
 * @param duration - Animation duration in ms
 * @param start - Start value (default 0)
 * @returns current counter value
 */
export function useCounter(
  end: number,
  duration: number = 2000,
  start: number = 0
): number {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = Date.now();
    const range = end - start;

    let rafId: number;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + range * eased;

      setCount(Math.round(current));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [end, duration, start, hasStarted]);

  return count;
}

/**
 * Hook for counter animation that starts when element is in view
 * @param end - End value
 * @param duration - Animation duration in ms
 * @param start - Start value (default 0)
 * @returns ref to attach to element and current counter value
 */
export function useCounterOnView<T extends HTMLElement>(
  end: number,
  duration: number = 2000,
  start: number = 0
): [React.RefObject<T>, number] {
  const [ref, isInView] = useInView<T>({ threshold: 0.3 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const count = useCounter(end, duration, start);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  return [ref, hasAnimated ? count : start];
}
