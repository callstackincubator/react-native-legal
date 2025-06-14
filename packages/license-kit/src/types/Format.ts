/**
 * Enumerates all valid CLI format flag values
 *
 * @see {@link Format}
 */
export const validFormats = ['json', 'about-json', 'text', 'markdown'] as const;

/**
 * Type of CLI flag that controls the output format
 */
export type Format = (typeof validFormats)[number];
