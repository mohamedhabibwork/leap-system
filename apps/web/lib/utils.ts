import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export slug utilities for convenience
export {
  generateSlug,
  generateUniqueSlug,
  isValidSlug,
  normalizeSlug,
  type SlugOptions,
} from './utils/slug';
