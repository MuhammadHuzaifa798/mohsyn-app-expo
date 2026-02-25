/**
 * Text processing utilities
 */

/**
 * Strips HTML tags from a string and decodes basic entities
 */
export const stripHtml = (html: string | undefined | null): string => {
    if (!html) return '';

    return html
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/<[^>]*>?/gm, '')
        .trim();
};
