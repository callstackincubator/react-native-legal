import fs from 'node:fs';
import path from 'node:path';

import { glob } from 'glob';

import { collectLicenseIds, parseLicenseExpression } from '../licenses';
import type {
  AboutLibrariesLibraryJsonPayload,
  AboutLibrariesLicenseJsonPayload,
  AboutLibrariesLikePackageInfo,
  AggregatedLicensesMapping,
  DependencyType,
  License,
  LicensePlistPayload,
  ParentPackageInfo,
  ScanPackageCallContext,
  ScanPackageOptionsFactory,
} from '../types';
import { YamlUtils } from '../utils';

import { PackageUtils } from './utils';

type InternalScanGroupSpecifier = { packages: [depName: string, depVersion: string][]; dependencyType: DependencyType };

/**
 * Finds the root directory of the package that a directory belongs to - the closest directory (itself or a parent)
 * containing a `package.json` with a `name` field. Nested `package.json` files without a name
 * (e.g. `lib/commonjs/package.json` containing only `{ "type": "commonjs" }`) are skipped.
 *
 * Works for packages installed in `node_modules` as well as for workspace / linked packages,
 * which are referenced by their real path (outside `node_modules`)
 *
 * @param startDir Absolute path to the directory to start the search from, e.g. the directory of a module file
 * @returns Path to the package root directory or `null` if the directory does not belong to any named package
 */
export function findPackageRoot(startDir: string): string | null {
  let dir = startDir;

  // `path.dirname` of the filesystem root returns the root itself, which ends the loop
  while (path.dirname(dir) !== dir) {
    if (hasNamedPackageJson(dir)) {
      return dir;
    }

    dir = path.dirname(dir);
  }

  return hasNamedPackageJson(dir) ? dir : null;
}

/**
 * Checks whether a directory contains a valid `package.json` with a `name` field
 *
 * @param dir Path to the directory to check
 */
function hasNamedPackageJson(dir: string): boolean {
  const packageJsonPath = path.join(dir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));

    return Boolean(packageJson.name);
  } catch {
    // invalid package.json - treat it as not a package root
    return false;
  }
}

/**
 * Collects license information for a given list of package directories, e.g. the packages found in the Metro dependency graph.
 * Unlike {@link scanDependencies}, it does not scan dependencies of the packages - the list is expected to be complete.
 *
 * @param packageRoots Paths to the root directories of the packages (directories containing `package.json`)
 * @returns Aggregated licenses object containing the given packages and their license information
 */
export function scanPackageRoots(packageRoots: string[]): AggregatedLicensesMapping {
  const result: AggregatedLicensesMapping = {};

  for (const packageRoot of packageRoots) {
    const packageJsonPath = path.join(packageRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      console.warn(`[react-native-legal] skipping ${packageRoot} could not find package.json`);
      continue;
    }

    try {
      const packageJson = require(path.resolve(packageJsonPath));

      if (!packageJson.name || packageJson.private === true) {
        continue;
      }

      const licenseInfo = readPackageLicenseInfo(packageJsonPath);

      result[`${licenseInfo.name}@${licenseInfo.version}`] = {
        ...licenseInfo,
        dependencyType: 'dependency',
        requiredVersion: licenseInfo.version,
        parentPackages: [],
      };
    } catch (error) {
      console.warn(`[react-native-legal] could not process package.json in ${packageRoot}`);
    }
  }

  return result;
}

/**
 * Reads license information of a single package, based only on its own files
 * (package.json and LICENSE file), without any context of how the package was found
 *
 * @param packageJsonPath Path to the package.json file of the package
 */
function readPackageLicenseInfo(
  packageJsonPath: string,
): Pick<
  License,
  'name' | 'author' | 'description' | 'rawLicense' | 'license' | 'licenseIds' | 'licenseFiles' | 'url' | 'version'
> {
  const packageJson = require(path.resolve(packageJsonPath));

  const rawLicense = PackageUtils.parseLicenseField(packageJson) ?? null;
  const license = parseLicenseExpression(rawLicense);
  const licenseIds = collectLicenseIds(license);
  const licenseFiles = PackageUtils.readLicenseFiles(path.dirname(packageJsonPath), licenseIds);

  return {
    name: packageJson.name,
    author: PackageUtils.parseAuthorField(packageJson),
    description: packageJson.description,
    rawLicense,
    license,
    licenseIds,
    licenseFiles,
    url: PackageUtils.parseRepositoryFieldToUrl(packageJson),
    version: packageJson.version,
  };
}

/**
 * Scans a single package and its dependencies for license information
 *
 * @param packageName Name of the package to scan
 * @param requiredVersion Version of the package to scan; this is the version specifier from package.json, e.g. `^1.0.0`, `~2.3.4`, etc.
 * @param processedPackages Set of already processed packages (avoids cycles)
 * @param result Aggregated licenses object to store the results; the keys will be in the format of `packageName@version` where version is the resolved version of the package
 * @param scanOptionsFactory Factory function to create scan options for dependencies; defaults to {@link PackageUtils.legacyDefaultScanPackageOptionsFactory}
 * @param isOptionalDependency Whether the package is an optional dependency, in which case a warning will not be logged if the corresponding package.json is not found; defaults to `false`
 * @param parentPackageRoot Optional path to the parent package root, has priority over default root to lock for dependencies in; used to discover different versions of the same package installed in nested node_modules, e.g. suppose `X@1`, `Y@1` where `Y@1` -> `X@2`; then, node_modules would have `X@1`, `Y@1` and `X@2` would be installed to `node_modules/Y/node_modules/X@2`
 */
function scanPackage(
  packageName: string,
  requiredVersion: string,
  processedPackages: Set<string>,
  result: AggregatedLicensesMapping,
  scanOptionsFactory: ScanPackageOptionsFactory = PackageUtils.legacyDefaultScanPackageOptionsFactory,
  {
    parentPackageRoot,
    parentPackageName,
    dependencyType,
    parentPackageRequiredVersion,
    parentPackageResolvedVersion,
  }: ScanPackageCallContext,
) {
  const requiredVersionPackageKey = `${packageName}@${requiredVersion}`;

  // Skip if already processed to avoid circular dependencies
  if (processedPackages.has(requiredVersionPackageKey)) {
    return;
  }

  // If the package is a file: dependency, warn about lack of support
  if (requiredVersion.startsWith('file:')) {
    console.warn(
      `[react-native-legal] ${packageName} (${requiredVersion}) is 'file:' dependency. Such packages are not supported yet (see https://callstackincubator.github.io/react-native-legal/docs/programmatic-usage.html#known-limitations).`,
    );
  }

  processedPackages.add(requiredVersionPackageKey);

  try {
    const localPackageJsonPath = PackageUtils.getPackageJsonPath(packageName, parentPackageRoot);

    if (!localPackageJsonPath) {
      // do not warn if the package is an optional dependency, it's normal it may not be installed
      if (!dependencyType.toLowerCase().includes('optional')) {
        console.warn(`[react-native-legal] skipping ${requiredVersionPackageKey} could not find package.json`);
      }

      return;
    }

    const localPackageJson = require(path.resolve(localPackageJsonPath));

    if (localPackageJson.private !== true) {
      const resolvedVersionPackageKey = `${packageName}@${localPackageJson.version}`;

      let parentPackageInfo: ParentPackageInfo | undefined;
      if (parentPackageName && parentPackageRequiredVersion && parentPackageResolvedVersion) {
        parentPackageInfo = {
          name: parentPackageName,
          requiredVersion: parentPackageRequiredVersion,
          resolvedVersion: parentPackageResolvedVersion,
        };
      }

      if (parentPackageInfo && resolvedVersionPackageKey in result) {
        result[resolvedVersionPackageKey].parentPackages = [
          ...(result[resolvedVersionPackageKey].parentPackages ?? []),
          parentPackageInfo,
        ];
      } else {
        result[resolvedVersionPackageKey] = {
          ...readPackageLicenseInfo(localPackageJsonPath),
          name: packageName,
          requiredVersion,
          parentPackages: parentPackageInfo ? [parentPackageInfo] : [],
          parentPackageRequiredVersion,
          parentPackageResolvedVersion,
          dependencyType,
        };
      }
    }

    const dependencies: MaybeDependencyMapping = localPackageJson.dependencies;
    const devDependencies: MaybeDependencyMapping = localPackageJson.devDependencies;
    const optionalDependencies: MaybeDependencyMapping = localPackageJson.optionalDependencies;
    const isWorkspacePackage = requiredVersion.startsWith('workspace:');

    const scanOptions = scanOptionsFactory({
      isRoot: false,
      isWorkspacePackage,
    });

    // check if transitive dependencies should be scanned
    if (!scanOptions.includeTransitiveDependencies) {
      return;
    }

    // helper used for finding nested dependencies installed with different versions for a given package, see docstring of scanPackage
    const currentPackageRoot = path.dirname(localPackageJsonPath);

    for (const { dependencyType, packages } of [
      {
        dependencyType: 'transitiveDependency',
        packages: dependencies ? Object.entries(dependencies) : [],
      },
      {
        dependencyType: 'transitiveDevDependency',
        packages: devDependencies && scanOptions.includeDevDependencies ? Object.entries(devDependencies) : [],
      },
      {
        dependencyType: 'transitiveOptionalDependency',
        packages:
          optionalDependencies && scanOptions.includeOptionalDependencies ? Object.entries(optionalDependencies) : [],
      },
    ] as InternalScanGroupSpecifier[]) {
      for (const [depName, depVersion] of packages) {
        scanPackage(depName, depVersion as string, processedPackages, result, scanOptionsFactory, {
          dependencyType,
          parentPackageRoot: currentPackageRoot,
          parentPackageName: packageName,
          parentPackageRequiredVersion: requiredVersion,
          parentPackageResolvedVersion: localPackageJson.version,
        });
      }
    }
  } catch (error) {
    console.warn(`[react-native-legal] could not process package.json for ${packageName}`);
  }
}

type DependencyMapping = Record<string, string>;
type MaybeDependencyMapping = DependencyMapping | undefined;

/**
 * Scans `package.json` and searches for all packages under `dependencies` field. Supports monorepo projects.
 *
 * @param appPackageJsonPath Path to the `package.json` file of the application
 * @param scanOptionsFactory Factory function to create scan options for dependencies; defaults to {@link PackageUtils.legacyDefaultScanPackageOptionsFactory}
 * @returns Aggregated licenses object containing all scanned dependencies and their license information
 */
export function scanDependencies(
  appPackageJsonPath: string,
  scanOptionsFactory: ScanPackageOptionsFactory = PackageUtils.legacyDefaultScanPackageOptionsFactory,
): AggregatedLicensesMapping {
  const appPackageJson = require(path.resolve(appPackageJsonPath));
  const dependencies: MaybeDependencyMapping = appPackageJson.dependencies;
  const devDependencies: MaybeDependencyMapping = appPackageJson.devDependencies;
  const optionalDependencies: MaybeDependencyMapping = appPackageJson.optionalDependencies;
  const result: AggregatedLicensesMapping = {};
  const processedPackages = new Set<string>();

  const rootScanOptions = scanOptionsFactory({ isRoot: true, isWorkspacePackage: false });

  for (const { dependencyType, packages } of [
    {
      dependencyType: 'dependency',
      packages: dependencies ? Object.entries(dependencies) : [],
    },
    {
      dependencyType: 'devDependency',
      packages: devDependencies && rootScanOptions.includeDevDependencies ? Object.entries(devDependencies) : [],
    },
    {
      dependencyType: 'optionalDependency',
      packages:
        optionalDependencies && rootScanOptions.includeOptionalDependencies ? Object.entries(optionalDependencies) : [],
    },
  ] as InternalScanGroupSpecifier[]) {
    for (const [depName, depVersion] of packages) {
      scanPackage(depName, depVersion as string, processedPackages, result, scanOptionsFactory, {
        dependencyType,
      });
    }
  }

  return result;
}

const PODSPEC_NAME_REGEX =
  /(Pod::Spec\.new\s+do\s+\|(?<specref>.*)\|).*(\k<specref>\.name\s+=\s+(?<quote>["'])(?<specname>[a-zA-Z0-9_\-@]+)\k<quote>)/;

/**
 * Generates LicensePlist-compatible metadata for NPM dependencies as a YAML string.
 *
 * To write a file directly, use `writeLicensePlistNPMOutput` function.
 *
 * @param licenses Scanned NPM licenses
 * @param iosProjectPath Path to the iOS project directory
 * @see {@link writeLicensePlistNPMOutput}
 */
export function generateLicensePlistNPMOutput(licenses: AggregatedLicensesMapping, iosProjectPath: string): string {
  const renames: Record<string, string> = {};
  const licenseEntries = Object.entries(licenses).map(([packageKey, license]) => {
    const normalizedPackageNameWithVersion = PackageUtils.normalizePackageName(packageKey);

    if (license.name !== normalizedPackageNameWithVersion) {
      renames[normalizedPackageNameWithVersion] = license.name;
    }

    // LicensePlist holds one `file`/`body` per package: a single license file is referenced directly,
    // otherwise every license text is concatenated into the body under a per-license heading
    const singleLicenseFile = license.licenseFiles.length === 1 ? license.licenseFiles[0].file : undefined;

    return {
      name: normalizedPackageNameWithVersion,
      version: license.version,
      ...(license.url && { source: license.url }),
      ...(singleLicenseFile
        ? { file: path.relative(iosProjectPath, singleLicenseFile) }
        : { body: PackageUtils.buildLicensePlistBody(license) }),
    } as LicensePlistPayload;
  });

  const excludedEntries = Object.values(licenses).reduce<Array<{ name: string }>>((acc, license) => {
    const packageName = license.name;
    const localPackageJsonPath = PackageUtils.getPackageJsonPath(packageName);

    if (!localPackageJsonPath) {
      return acc;
    }

    const podspecFiles = glob.sync('**.podspec', {
      cwd: path.dirname(localPackageJsonPath),
      absolute: true,
      nocase: true,
      nodir: true,
      ignore: '**/{__tests__,__fixtures__,__mocks__}/**',
    });

    if (!podspecFiles) {
      return acc;
    }

    const podspecEntries = podspecFiles.map((podspecFile) => {
      const podspecContent = fs.readFileSync(podspecFile, { encoding: 'utf-8' });
      const podspecContentShrinked = podspecContent.replace(/\n/g, ' ');
      const { specname } = PODSPEC_NAME_REGEX.exec(podspecContentShrinked)?.groups ?? {};

      return { name: specname ?? packageName };
    });

    return [...acc, ...podspecEntries];
  }, []);

  const yamlDoc = {
    ...(Object.keys(renames).length > 0 && { rename: renames }),
    manual: licenseEntries,
    /**
     * Adding excludes to prevent duplicates - NPM packages with iOS Podspecs are already
     * manually included in the `licenseEntries`. However License Plist is automatically including all
     * the entries detected via Pods-<project-name>-acknowledgements.plist, which also
     * includes the NPM package with iOS Podspecs - let's filter them out,
     * so that only the manual NPM entries are displayed
     */
    exclude: excludedEntries,
  };

  const yamlContent = [
    '# BEGIN Generated NPM license entries',
    YamlUtils.toYaml(yamlDoc),
    '# END Generated NPM license entries',
  ].join('\n');

  return yamlContent;
}

/**
 * Writes LicensePlist-compatible metadata for NPM dependencies to a file
 *
 * This will take scanned NPM licenses and produce following output inside iOS project's directory:
 *
 * ```
 * | - ios
 * | ---- myawesomeapp
 * | ---- myawesomeapp.xcodeproj
 * | ---- myawesomeapp.xcodeworkspace
 * | ---- license_plist.yml <--- generated LicensePlist config with NPM dependencies
 * | ---- Podfile
 * | ---- Podfile.lock
 * ```
 *
 * @param licenses Scanned NPM licenses
 * @param iosProjectPath Path to the iOS project directory
 * @param plistLikeOutput Optional pre-generated string output to use instead of generating it using `generateLicensePlistNPMOutput`
 * @see {@link generateLicensePlistNPMOutput}
 */
export function writeLicensePlistNPMOutput(
  licenses: AggregatedLicensesMapping,
  iosProjectPath: string,
  plistLikeOutput?: string,
) {
  if (!plistLikeOutput) {
    plistLikeOutput = generateLicensePlistNPMOutput(licenses, iosProjectPath);
  }

  fs.writeFileSync(path.join(iosProjectPath, 'license_plist.yml'), plistLikeOutput, { encoding: 'utf-8' });
}

/**
 * Generates AboutLibraries-compatible metadata for NPM dependencies
 *
 * This will take scanned NPM licenses and produce output that can be modified and/or written to the Android project files.
 *
 * @param licenses Scanned NPM licenses
 * @returns Array of AboutLibrariesLikePackage objects, each representing a NPM dependency
 * @see {@link writeAboutLibrariesNPMOutput}
 */
export function generateAboutLibrariesNPMOutput(licenses: AggregatedLicensesMapping): AboutLibrariesLikePackageInfo[] {
  return Object.entries(licenses).map(([packageKey, license]) => {
    const uniqueId = PackageUtils.normalizePackageName(packageKey);
    const licenseJsonPayloads: AboutLibrariesLicenseJsonPayload[] = PackageUtils.prepareAboutLibrariesLicenses(
      license,
    ).map(({ name, content }) => ({
      content,
      hash: PackageUtils.prepareAboutLibrariesLicenseField(name, content),
      name,
      url: '',
    }));

    const libraryJsonPayload: AboutLibrariesLibraryJsonPayload = {
      artifactVersion: license.version,
      description: license.description ?? '',
      developers: [{ name: license.author ?? '', organisationUrl: '' }],
      licenses: licenseJsonPayloads.map(({ hash }) => hash),
      name: license.name,
      tag: '',
      uniqueId,
      website: license.url,
    };

    return {
      normalizedPackageNameWithVersion: uniqueId,
      libraryJsonPayload,
      licenseJsonPayloads,
    };
  });
}

/**
 * Generates AboutLibraries-compatible metadata for NPM dependencies
 *
 * This will take scanned NPM licenses and produce following output inside android project's directory:
 *
 * ```
 * | - android
 * | ---- app
 * | ---- config <--- generated AboutLibraries config directory
 * | ------- libraries <--- generated directory with JSON files list of NPM dependencies
 * | ------- licenses <--- generated directory with JSON files list of used licenses
 * | ---- build.gradle
 * | ---- settings.gradle
 * ```
 *
 * @param licenses Scanned NPM licenses
 * @param androidProjectPath Path to the Android project directory
 * @param aboutLibrariesLikeOutput Optional pre-generated output to use instead of generating it using `generateAboutLibrariesNPMOutput`
 * @see {@link generateAboutLibrariesNPMOutput}
 */
export function writeAboutLibrariesNPMOutput(
  licenses: AggregatedLicensesMapping,
  androidProjectPath: string,
  aboutLibrariesLikeOutput?: AboutLibrariesLikePackageInfo[],
) {
  const aboutLibrariesConfigDirPath = path.join(androidProjectPath, 'config');
  const aboutLibrariesConfigLibrariesDirPath = path.join(aboutLibrariesConfigDirPath, 'libraries');
  const aboutLibrariesConfigLicensesDirPath = path.join(aboutLibrariesConfigDirPath, 'licenses');

  if (!fs.existsSync(aboutLibrariesConfigDirPath)) {
    fs.mkdirSync(aboutLibrariesConfigDirPath);
  }

  if (!fs.existsSync(aboutLibrariesConfigLibrariesDirPath)) {
    fs.mkdirSync(aboutLibrariesConfigLibrariesDirPath);
  }

  if (!fs.existsSync(aboutLibrariesConfigLicensesDirPath)) {
    fs.mkdirSync(aboutLibrariesConfigLicensesDirPath);
  }

  if (!aboutLibrariesLikeOutput) {
    aboutLibrariesLikeOutput = generateAboutLibrariesNPMOutput(licenses);
  }

  aboutLibrariesLikeOutput.forEach(({ normalizedPackageNameWithVersion, libraryJsonPayload, licenseJsonPayloads }) => {
    const libraryJsonFilePath = path.join(
      aboutLibrariesConfigLibrariesDirPath,
      `${normalizedPackageNameWithVersion}.json`,
    );

    fs.writeFileSync(libraryJsonFilePath, JSON.stringify(libraryJsonPayload));

    for (const licenseJsonPayload of licenseJsonPayloads) {
      const licenseJsonFilePath = path.join(aboutLibrariesConfigLicensesDirPath, `${licenseJsonPayload.hash}.json`);

      if (!fs.existsSync(licenseJsonFilePath)) {
        fs.writeFileSync(licenseJsonFilePath, JSON.stringify(licenseJsonPayload));
      }
    }
  });
}
