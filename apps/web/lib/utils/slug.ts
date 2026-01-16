/**
 * Slug generation utility functions
 * Provides consistent slug generation across the application
 */

export interface SlugOptions {
  /**
   * Add a suffix to make the slug unique (e.g., timestamp)
   */
  suffix?: string | number;
  
  /**
   * Maximum length of the slug (excluding suffix)
   */
  maxLength?: number;
  
  /**
   * Separator character (default: '-')
   */
  separator?: string;
  
  /**
   * Whether to preserve case (default: false, converts to lowercase)
   */
  preserveCase?: boolean;
}

/**
 * Generates a URL-friendly slug from a string
 * 
 * @param text - The text to convert to a slug
 * @param options - Optional configuration for slug generation
 * @returns A URL-friendly slug string
 * 
 * @example
 * ```ts
 * generateSlug('Hello World!') // 'hello-world'
 * generateSlug('Hello World!', { suffix: Date.now() }) // 'hello-world-1234567890'
 * generateSlug('Hello World!', { maxLength: 10 }) // 'hello-worl'
 * ```
 */
export function generateSlug(text: string, options: SlugOptions = {}): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const {
    suffix,
    maxLength,
    separator = '-',
    preserveCase = false,
  } = options;

  // Convert to lowercase unless preserveCase is true
  let slug = preserveCase ? text : text.toLowerCase();

  // Replace Arabic characters with their transliterated equivalents
  // This helps with Arabic text support
  slug = transliterateArabic(slug);

  // Replace spaces and special characters with separator
  // Keep only alphanumeric characters and the separator
  slug = slug
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Remove special characters, keep unicode letters/numbers/spaces/hyphens
    .replace(/\s+/g, separator) // Replace spaces with separator
    .replace(new RegExp(`${separator}+`, 'g'), separator) // Replace multiple separators with single separator
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), ''); // Remove leading/trailing separators

  // Apply max length if specified
  if (maxLength && slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove trailing separator if truncated
    slug = slug.replace(new RegExp(`${separator}$`, 'g'), '');
  }

  // Add suffix if provided
  if (suffix !== undefined) {
    const suffixStr = String(suffix);
    slug = slug ? `${slug}${separator}${suffixStr}` : suffixStr;
  }

  return slug;
}

/**
 * Generates a unique slug by appending a timestamp
 * Useful for ensuring uniqueness when creating new entities
 * 
 * @param text - The text to convert to a slug
 * @param options - Optional configuration (suffix will be overridden with timestamp)
 * @returns A unique slug with timestamp suffix
 * 
 * @example
 * ```ts
 * generateUniqueSlug('Hello World') // 'hello-world-1234567890'
 * ```
 */
export function generateUniqueSlug(text: string, options: Omit<SlugOptions, 'suffix'> = {}): string {
  return generateSlug(text, {
    ...options,
    suffix: Date.now(),
  });
}

/**
 * Transliterates Arabic characters to their Latin equivalents
 * This helps create readable slugs from Arabic text
 * 
 * @param text - Text that may contain Arabic characters
 * @returns Text with Arabic characters transliterated
 */
function transliterateArabic(text: string): string {
  const arabicMap: Record<string, string> = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th',
    'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
    'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    'ة': 'h', 'ء': 'a', 'ئ': 'y', 'ؤ': 'w',
  };

  return text.replace(/[\u0600-\u06FF]/g, (char) => arabicMap[char] || char);
}

/**
 * Validates if a string is a valid slug format
 * 
 * @param slug - The slug to validate
 * @returns True if the slug is valid, false otherwise
 * 
 * @example
 * ```ts
 * isValidSlug('hello-world') // true
 * isValidSlug('hello world') // false (contains space)
 * isValidSlug('hello--world') // false (double separator)
 * ```
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Slug should:
  // - Only contain lowercase letters, numbers, and hyphens
  // - Not start or end with a hyphen
  // - Not contain consecutive hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Normalizes an existing slug to ensure it follows the correct format
 * Useful for cleaning up user-provided slugs
 * 
 * @param slug - The slug to normalize
 * @param options - Optional configuration
 * @returns A normalized slug
 * 
 * @example
 * ```ts
 * normalizeSlug('Hello--World') // 'hello-world'
 * normalizeSlug('  Hello World  ') // 'hello-world'
 * ```
 */
export function normalizeSlug(slug: string, options: SlugOptions = {}): string {
  return generateSlug(slug, options);
}
