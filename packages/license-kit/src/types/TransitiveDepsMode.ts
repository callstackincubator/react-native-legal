/**
 * Enumerates all valid CLI transitive deps mode flag values
 *
 * @see {@link TransitiveDepsMode}
 */
export const validTransitiveDepsModes = ['all', 'from-external-only', 'from-workspace-only', 'none'] as const;

/**
 * Type of CLI flag that controls, which transitive dependencies are included:
 * - 'all'
 * - 'from-external-only' (only transitive dependencies of direct dependencies specified by non-workspace:... specifiers)
 * - 'from-workspace-only' (only transitive dependencies of direct dependencies specified by `workspace:` specifier)
 * - 'none'
 */
export type TransitiveDepsMode = (typeof validTransitiveDepsModes)[number];
