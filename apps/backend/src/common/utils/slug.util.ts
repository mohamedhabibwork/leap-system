/**
 * Generates a URL-friendly slug from a given string
 * 
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug string
 * 
 * @example
 * generateSlug('Hello World!') // 'hello-world'
 * generateSlug('  Test   String  ') // 'test-string'
 * generateSlug('Special@Characters#Here') // 'specialcharactershere'
 */
export function generateSlug(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove all non-word characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}
