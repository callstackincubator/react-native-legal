import fs from 'fs';
import path from 'path';

import glob from 'glob';

import type {
  AboutLibrariesLibraryJsonPayload,
  AboutLibrariesLicenseJsonPayload,
  AboutLibrariesLikePackageInfo,
  AggregatedLicensesObj,
  DependencyType,
  LicensePlistPayload,
  ScanPackageCallContext,
  ScanPackageOptionsFactory,
} from './types';
import { PackageUtils, YamlUtils } from './utils';

type InternalScanGroupSpecifier = { packages: [depName: string, depVersion: string][]; dependencyType: DependencyType };

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
  result: AggregatedLicensesObj,
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
      const licenseFiles = glob.sync('LICEN{S,C}E{.md,}', {
        cwd: path.dirname(localPackageJsonPath),
        absolute: true,
        nocase: true,
        nodir: true,
        ignore: '**/{__tests__,__fixtures__,__mocks__}/**',
      });

      const resolvedVersionPackageKey = `${packageName}@${localPackageJson.version}`;

      result[resolvedVersionPackageKey] = {
        name: packageName,
        author: PackageUtils.parseAuthorField(localPackageJson),
        content: licenseFiles?.[0] ? fs.readFileSync(licenseFiles[0], { encoding: 'utf-8' }) : undefined,
        file: licenseFiles?.[0] ? licenseFiles[0] : undefined,
        description: localPackageJson.description,
        type: PackageUtils.parseLicenseField(localPackageJson),
        url: PackageUtils.parseRepositoryFieldToUrl(localPackageJson),
        version: localPackageJson.version,
        requiredVersion,
        parentPackageName,
        parentPackageRequiredVersion,
        parentPackageResolvedVersion,
        dependencyType,
      };
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
): AggregatedLicensesObj {
  const appPackageJson = require(path.resolve(appPackageJsonPath));
  const dependencies: MaybeDependencyMapping = appPackageJson.dependencies;
  const devDependencies: MaybeDependencyMapping = appPackageJson.devDependencies;
  const optionalDependencies: MaybeDependencyMapping = appPackageJson.optionalDependencies;
  const result: AggregatedLicensesObj = {};
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

/**
 * Generates LicensePlist-compatible metadata for NPM dependencies as a YAML string.
 *
 * To write a file directly, use `writeLicensePlistNPMOutput` function.
 *
 * @param licenses Scanned NPM licenses
 * @param iosProjectPath Path to the iOS project directory
 * @see {@link writeLicensePlistNPMOutput}
 */
export function generateLicensePlistNPMOutput(licenses: AggregatedLicensesObj, iosProjectPath: string): string {
  const renames: Record<string, string> = {};
  const licenseEntries = Object.entries(licenses).map(([packageKey, licenseObj]) => {
    const normalizedPackageNameWithVersion = PackageUtils.normalizePackageName(packageKey);

    if (licenseObj.name !== normalizedPackageNameWithVersion) {
      renames[normalizedPackageNameWithVersion] = licenseObj.name;
    }

    const relativeLicenseFile = licenseObj.file ? path.relative(iosProjectPath, licenseObj.file) : undefined;

    return {
      name: normalizedPackageNameWithVersion,
      version: licenseObj.version,
      ...(licenseObj.url && { source: licenseObj.url }),
      ...(licenseObj.file
        ? { file: relativeLicenseFile }
        : { body: licenseObj.content ?? licenseObj.type ?? 'UNKNOWN' }),
    } as LicensePlistPayload;
  });

  const yamlDoc = {
    ...(Object.keys(renames).length > 0 && { rename: renames }),
    manual: licenseEntries,
  };

  const yamlContent = [
    '# BEGIN Generated NPM license entries',
    YamlUtils.toYaml(yamlDoc),
    '# END Generated NPM license entries',
  ].join('\n');

  const dummy = 42;

  console.log(dummy);

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
  licenses: AggregatedLicensesObj,
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
export function generateAboutLibrariesNPMOutput(licenses: AggregatedLicensesObj): AboutLibrariesLikePackageInfo[] {
  return Object.entries(licenses)
    .map(([packageKey, licenseObj]) => {
      return {
        artifactVersion: licenseObj.version,
        content: licenseObj.content ?? '',
        description: licenseObj.description ?? '',
        developers: [{ name: licenseObj.author ?? '', organisationUrl: '' }],
        licenses: [PackageUtils.prepareAboutLibrariesLicenseField(licenseObj)],
        name: licenseObj.name,
        tag: '',
        type: licenseObj.type,
        uniqueId: PackageUtils.normalizePackageName(packageKey),
        website: licenseObj.url,
      };
    })
    .map((jsonPayload) => {
      const libraryJsonPayload: AboutLibrariesLibraryJsonPayload = {
        artifactVersion: jsonPayload.artifactVersion,
        description: jsonPayload.description,
        developers: jsonPayload.developers,
        licenses: jsonPayload.licenses,
        name: jsonPayload.name,
        tag: jsonPayload.tag,
        uniqueId: jsonPayload.uniqueId,
        website: jsonPayload.website,
      };
      const licenseJsonPayload: AboutLibrariesLicenseJsonPayload = {
        content: jsonPayload.content,
        hash: jsonPayload.licenses[0],
        name: jsonPayload.type ?? '',
        url: '',
      };

      return {
        normalizedPackageNameWithVersion: jsonPayload.uniqueId,
        libraryJsonPayload,
        licenseJsonPayload,
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
  licenses: AggregatedLicensesObj,
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

  aboutLibrariesLikeOutput.forEach(({ normalizedPackageNameWithVersion, libraryJsonPayload, licenseJsonPayload }) => {
    const libraryJsonFilePath = path.join(
      aboutLibrariesConfigLibrariesDirPath,
      `${normalizedPackageNameWithVersion}.json`,
    );
    const licenseJsonFilePath = path.join(aboutLibrariesConfigLicensesDirPath, `${licenseJsonPayload.hash}.json`);

    fs.writeFileSync(libraryJsonFilePath, JSON.stringify(libraryJsonPayload));

    if (!fs.existsSync(licenseJsonFilePath)) {
      fs.writeFileSync(licenseJsonFilePath, JSON.stringify(licenseJsonPayload));
    }
  });
}
