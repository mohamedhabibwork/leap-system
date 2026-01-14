/**
 * Design Tokens for LEAP LMS Platform
 * Centralized design system constants for consistent styling
 */

export const designTokens = {
  // Typography Scale
  typography: {
    hero: 'text-[3rem] leading-[1.1] font-[800] tracking-[-0.02em]',
    display: 'text-[2.25rem] leading-[1.2] font-[700] tracking-[-0.01em]',
    subtitle: 'text-[1.25rem] leading-[1.4] font-[600]',
    bodyLg: 'text-[1.125rem] leading-[1.6]',
    body: 'text-[1rem] leading-[1.6]',
    small: 'text-[0.875rem] leading-[1.5]',
    tiny: 'text-[0.75rem] leading-[1.4]',
  },

  // Spacing Scale
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // Border Radius
  radius: {
    xs: '4px',
    sm: '6px',
    md: '10px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    elevated: '0 10px 40px -10px rgb(0 0 0 / 0.15)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Section Colors (semantic)
  sections: {
    social: {
      light: 'oklch(0.662 0.167 303.9)',
      dark: 'oklch(0.627 0.265 303.9)',
    },
    courses: {
      light: 'oklch(0.588 0.243 264.376)',
      dark: 'oklch(0.488 0.243 264.376)',
    },
    jobs: {
      light: 'oklch(0.696 0.198 41.116)',
      dark: 'oklch(0.645 0.246 16.439)',
    },
    events: {
      light: 'oklch(0.654 0.17 162.48)',
      dark: 'oklch(0.696 0.17 162.48)',
    },
  },

  // Status Colors
  status: {
    success: 'oklch(0.654 0.17 162.48)',
    warning: 'oklch(0.828 0.189 84.429)',
    error: 'oklch(0.577 0.245 27.325)',
    info: 'oklch(0.588 0.243 264.376)',
  },

  // Animations
  transitions: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Z-Index Scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
} as const;

export type DesignTokens = typeof designTokens;