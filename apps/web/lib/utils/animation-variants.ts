/**
 * Animation variants for consistent animations across the application
 * These can be used with Tailwind CSS classes or inline styles
 */

export const fadeInVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

export const fadeInUpVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: 20,
  },
};

export const fadeInDownVariants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

export const slideInLeftVariants = {
  initial: {
    opacity: 0,
    x: -30,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -30,
  },
};

export const slideInRightVariants = {
  initial: {
    opacity: 0,
    x: 30,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 30,
  },
};

export const scaleInVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
  },
};

export const staggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerFastContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * CSS class-based animations for use with Tailwind
 * These provide similar effects without JavaScript
 */
export const animationClasses = {
  fadeIn: 'animate-in fade-in duration-700',
  fadeInUp: 'animate-in fade-in slide-in-from-bottom-4 duration-700',
  fadeInDown: 'animate-in fade-in slide-in-from-top-4 duration-700',
  fadeInLeft: 'animate-in fade-in slide-in-from-left-8 duration-700',
  fadeInRight: 'animate-in fade-in slide-in-from-right-8 duration-700',
  scaleIn: 'animate-in fade-in zoom-in-95 duration-500',
  slideUp: 'animate-in slide-in-from-bottom-full duration-500',
  slideDown: 'animate-in slide-in-from-top-full duration-500',
};

/**
 * Stagger delay utilities
 */
export const getStaggerDelay = (index: number, baseDelay: number = 100): string => {
  return `delay-[${index * baseDelay}ms]`;
};

/**
 * Animation duration utilities
 */
export const durations = {
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000,
};

/**
 * Easing functions
 */
export const easings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
};

/**
 * Generates inline style object for animations
 */
export const getAnimationStyle = (
  variant: keyof typeof fadeInVariants,
  duration: number = durations.normal,
  delay: number = 0,
  easing: string = easings.easeOut
) => {
  return {
    transition: `all ${duration}ms ${easing} ${delay}ms`,
  };
};

/**
 * Prefers reduced motion check
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Safe animation wrapper that respects user preferences
 */
export const getSafeAnimationClass = (animationClass: string): string => {
  if (prefersReducedMotion()) {
    return '';
  }
  return animationClass;
};

/**
 * Hover effect classes
 */
export const hoverEffects = {
  lift: 'transition-transform duration-300 hover:-translate-y-1',
  scale: 'transition-transform duration-300 hover:scale-105',
  scaleSmall: 'transition-transform duration-300 hover:scale-102',
  glow: 'transition-shadow duration-300 hover:shadow-lg',
  brighten: 'transition-opacity duration-300 hover:opacity-80',
};

/**
 * Parallax transform helper
 */
export const getParallaxTransform = (offset: number): string => {
  return `translateY(${offset}px)`;
};

/**
 * Scroll reveal class generator
 */
export const getScrollRevealClass = (isVisible: boolean, baseClass: string = animationClasses.fadeInUp): string => {
  if (prefersReducedMotion()) {
    return 'opacity-100';
  }
  return isVisible ? `${baseClass} opacity-100` : 'opacity-0';
};
