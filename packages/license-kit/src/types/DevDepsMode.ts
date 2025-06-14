/**
 * Enumerates all valid CLI development dependencies mode flag values
 *
 * @see {@link TransitiveDepsMode}
 */
export const validDevDepsModes = ['root-only', 'none'] as const;

/**
 * Type of CLI flag that controls, whether and how development dependencies are included:
 * - 'root-only' (only direct devDependencies from the scanned project's root package.json)
 * - 'none'
 */
export type DevDepsMode = (typeof validDevDepsModes)[number];
