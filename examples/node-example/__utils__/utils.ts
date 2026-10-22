import child_process from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { stripVTControlCharacters } from 'node:util';

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

/**
 * Runs the `license-kit` CLI of the workspace with the given arguments.
 * Output is stripped of ANSI escape codes, as CI forces colors on. Never rejects: a failing command resolves with its (non-zero) exit code.
 */
export function runLicenseKit(args: string[] = []) {
  return new Promise<{ exitCode: number; stdout: string; stderr: string }>((resolve) => {
    child_process.exec(
      `yarn license-kit ${args.join(' ')}`,
      { maxBuffer: 1024 * 1024 * 100 }, // 100MB
      (error, stdout, stderr) => {
        resolve({
          exitCode: typeof error?.code === 'number' ? error.code : 0,
          stdout: stripVTControlCharacters(stdout),
          stderr: stripVTControlCharacters(stderr),
        });
      },
    );
  });
}

/**
 * All workspace packages that are not meant to be published to NPM need to be private
 *
 * The problem is that we would like to use some fixture packages for tests and for that we actually need
 * to have them non-private :C
 *
 * The solution is to make them non-private only in test environment - jest exposes `globalSetup` and `globalTeardown`
 * that we can use to monkey patch the packages before and after all test suite run (not ideal, but works)
 */
export function patchFixturesPackages(fixturesDir: string, isPrivate: boolean) {
  for (const packageName of fs.readdirSync(fixturesDir)) {
    if (packageName === 'example-private-package') {
      continue;
    }

    const packagePath = path.join(fixturesDir, packageName, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));

    if (isPrivate) {
      packageJson.private = true;
    } else {
      delete packageJson.private;
    }

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', { encoding: 'utf8' });
  }
}
