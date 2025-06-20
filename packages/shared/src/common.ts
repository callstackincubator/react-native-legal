import fs from 'fs';
import path from 'path';

import glob from 'glob';

import {
  type AboutLibrariesLibraryJsonPayload,
  type AboutLibrariesLicenseJsonPayload,
  type AboutLibrariesLikePackageInfo,
  type AggregatedLicensesObj,
  type LicensePlistPayload,
  type ScanPackageOptionsFactory,
} from './types';
import { PackageUtils, YamlUtils } from './utils';

/**
 * Scans a single package and its dependencies for license information
 *
 * @param packageName - Name of the package to scan
 * @param version - Version of the package to scan
 * @param processedPackages - Set of already processed packages (avoids cycles)
 * @param result - Aggregated licenses object to store the results
 * @param scanOptionsFactory - Factory function to create scan options for dependencies; defaults to {@link PackageUtils.legacyDefaultScanPackageOptionsFactory}
 * @param isOptionalDependency - Whether the package is an optional dependency, in which case a warning will not be logged if the corresponding package.json is not found; defaults to `false`
 */
function scanPackage(
  packageName: string,
  version: string,
  processedPackages: Set<string>,
  result: AggregatedLicensesObj,
  scanOptionsFactory: ScanPackageOptionsFactory = PackageUtils.legacyDefaultScanPackageOptionsFactory,
  isOptionalDependency = false,
) {
  const packageKey = `${packageName}@${version}`;

  // Skip if already processed to avoid circular dependencies
  if (processedPackages.has(packageKey)) {
    return;
  }

  // If the package is a file: dependency, warn about lack of support
  if (version.startsWith('file:')) {
    console.warn(
      `[react-native-legal] ${packageName} (${version}) is 'file:' dependency. Such packages are not supported yet (see https://callstackincubator.github.io/react-native-legal/docs/programmatic-usage.html#known-limitations).`,
    );
  }

  processedPackages.add(packageKey);

  try {
    const localPackageJsonPath = PackageUtils.getPackageJsonPath(packageName);

    if (!localPackageJsonPath) {
      if (!isOptionalDependency) {
        console.warn(`[react-native-legal] skipping ${packageName} could not find package.json`);
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

      result[packageName] = {
        author: PackageUtils.parseAuthorField(localPackageJson),
        content: licenseFiles?.[0] ? fs.readFileSync(licenseFiles[0], { encoding: 'utf-8' }) : undefined,
        file: licenseFiles?.[0] ? licenseFiles[0] : undefined,
        description: localPackageJson.description,
        type: PackageUtils.parseLicenseField(localPackageJson),
        url: PackageUtils.parseRepositoryFieldToUrl(localPackageJson),
        version: localPackageJson.version,
      };
    }

    const dependencies = localPackageJson.dependencies;
    const devDependencies = localPackageJson.devDependencies;
    const optionalDependencies = localPackageJson.optionalDependencies;
    const isWorkspacePackage = version.startsWith('workspace:');

    const scanOptions = scanOptionsFactory({
      isRoot: false,
      isWorkspacePackage,
    });

    // check if transitive dependencies should be scanned
    if (!scanOptions.includeTransitiveDependencies) {
      return;
    }

    [
      // transitive dependencies
      ...(dependencies ? Object.entries(dependencies) : []),
      // transitive devDependencies
      ...(devDependencies && scanOptions.includeDevDependencies ? Object.entries(devDependencies) : []),
    ].forEach(([depName, depVersion]) => {
      scanPackage(depName, depVersion as string, processedPackages, result, scanOptionsFactory, false);
    });

    // transitive optionalDependencies
    (optionalDependencies && scanOptions.includeOptionalDependencies
      ? Object.entries(optionalDependencies)
      : []
    ).forEach(([depName, depVersion]) => {
      scanPackage(depName, depVersion as string, processedPackages, result, scanOptionsFactory, true);
    });
  } catch (error) {
    console.warn(`[react-native-legal] could not process package.json for ${packageName}`);
  }
}

type MaybeDependencyMapping = Record<string, string> | undefined;

/**
 * Scans `package.json` and searches for all packages under `dependencies` field. Supports monorepo projects.
 *
 * @param appPackageJsonPath - Path to the `package.json` file of the application
 * @param scanOptionsFactory - Factory function to create scan options for dependencies; defaults to {@link PackageUtils.legacyDefaultScanPackageOptionsFactory}
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

  [
    // dependencies
    ...(dependencies ? Object.entries(dependencies) : []),
    // devDependencies
    ...(devDependencies && rootScanOptions.includeDevDependencies ? Object.entries(devDependencies) : []),
  ].forEach(([packageName, version]) => {
    scanPackage(packageName, version, processedPackages, result, scanOptionsFactory, false);
  });

  // optionalDependencies
  (optionalDependencies && rootScanOptions.includeOptionalDependencies
    ? Object.entries(optionalDependencies)
    : []
  ).forEach(([depName, depVersion]) => {
    scanPackage(depName, depVersion as string, processedPackages, result, scanOptionsFactory, true);
  });

  return result;
}

/**
 * Generates LicensePlist-compatible metadata for NPM dependencies as a YAML string.
 *
 * To write a file directly, use `writeLicensePlistNPMOutput` function.
 *
 * @param licenses - Scanned NPM licenses
 * @param iosProjectPath - Path to the iOS project directory
 * @see {@link writeLicensePlistNPMOutput}
 */
export function generateLicensePlistNPMOutput(licenses: AggregatedLicensesObj, iosProjectPath: string): string {
  const renames: Record<string, string> = {};
  const licenseEntries = Object.entries(licenses).map(([dependency, licenseObj]) => {
    const normalizedName = PackageUtils.normalizePackageName(dependency);

    if (dependency !== normalizedName) {
      renames[normalizedName] = dependency;
    }

    const relativeLicenseFile = licenseObj.file ? path.relative(iosProjectPath, licenseObj.file) : undefined;

    return {
      name: normalizedName,
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
 * @param licenses - Scanned NPM licenses
 * @param iosProjectPath - Path to the iOS project directory
 * @param plistLikeOutput - Optional pre-generated string output to use instead of generating it using `generateLicensePlistNPMOutput`
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
 * @param licenses - Scanned NPM licenses
 * @returns Array of AboutLibrariesLikePackage objects, each representing a NPM dependency
 * @see {@link writeAboutLibrariesNPMOutput}
 */
export function generateAboutLibrariesNPMOutput(licenses: AggregatedLicensesObj): AboutLibrariesLikePackageInfo[] {
  return Object.entries(licenses)
    .map(([dependency, licenseObj]) => {
      return {
        artifactVersion: licenseObj.version,
        content: licenseObj.content ?? '',
        description: licenseObj.description ?? '',
        developers: [{ name: licenseObj.author ?? '', organisationUrl: '' }],
        licenses: [PackageUtils.prepareAboutLibrariesLicenseField(licenseObj)],
        name: dependency,
        tag: '',
        type: licenseObj.type,
        uniqueId: PackageUtils.normalizePackageName(dependency),
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
      };
      const licenseJsonPayload: AboutLibrariesLicenseJsonPayload = {
        content: jsonPayload.content,
        hash: jsonPayload.licenses[0],
        name: jsonPayload.type ?? '',
        url: '',
      };

      return {
        normalizedPackageName: PackageUtils.normalizePackageName(jsonPayload.name),
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
 * @param licenses - Scanned NPM licenses
 * @param androidProjectPath - Path to the Android project directory
 * @param aboutLibrariesLikeOutput - Optional pre-generated output to use instead of generating it using `generateAboutLibrariesNPMOutput`
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

  aboutLibrariesLikeOutput.forEach(({ normalizedPackageName, libraryJsonPayload, licenseJsonPayload }) => {
    const libraryJsonFilePath = path.join(aboutLibrariesConfigLibrariesDirPath, `${normalizedPackageName}.json`);
    const licenseJsonFilePath = path.join(aboutLibrariesConfigLicensesDirPath, `${licenseJsonPayload.hash}.json`);

    fs.writeFileSync(libraryJsonFilePath, JSON.stringify(libraryJsonPayload));

    if (!fs.existsSync(licenseJsonFilePath)) {
      fs.writeFileSync(licenseJsonFilePath, JSON.stringify(licenseJsonPayload));
    }
  });
}
