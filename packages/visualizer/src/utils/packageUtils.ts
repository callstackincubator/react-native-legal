import type { Types } from '@callstack/licenses';

/**
 * Builds a package key from a name and version.
 * @param metaLike The name and version of the package
 * @returns The package key in the format of `packageName@version`
 */
export function buildPackageKey(metaLike: Pick<Types.License, 'name' | 'version'>) {
  return `${metaLike.name}@${metaLike.version}`;
}
