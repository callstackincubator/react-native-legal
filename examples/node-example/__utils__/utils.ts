/**
 * Returns the internal representation format keys for the dependencies in a package.json file.
 * The keys are in the format of `packageName@version`.
 * @param dependencyMapping the mapping of package names to their versions from package.json's appropriate section
 * @returns the list of internal representation format keys to those dependencies in the same order as the entries in the mapping
 */
export function dependencyMappingToCorrespondingKey(dependencyMapping: Record<string, string>) {
  return Object.entries(dependencyMapping).map(([name, version]) => `${name}@${version}`);
}

/**
 * Returns the internal representation format key for a given package name.
 * This key is in the format of `packageName@version`.
 * @param dependencyMapping The mapping of package names to their versions from package.json's appropriate section
 * @param packageName The name of the package to get the corresponding key for
 * @returns The internal representation format key for the given package name, or undefined if the package is not in the mapping
 */
export function getDependencyCorrespondingKey(
  dependencyMapping: Record<string, string>,
  packageName: string,
): string | undefined {
  return dependencyMapping[packageName]
    ? `${packageName}@${dependencyMapping[packageName].replace('^', '').replace('~', '')}`
    : undefined;
}

/**
 * Strips the version suffixes from a list of results.
 * The version suffix is the part after the last '@' character in each result string.
 *
 * @param listOfResults The list of results to strip version suffixes from
 * @returns The list of results with version suffixes stripped
 */
export function stripVersionSuffixes(listOfResults: string[]): string[] {
  return listOfResults.map((result) => {
    const lastAtIndex = result.lastIndexOf('@');

    return lastAtIndex !== -1 ? result.slice(0, lastAtIndex) : result;
  });
}
