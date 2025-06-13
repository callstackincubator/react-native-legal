import fs from 'fs';
import path from 'path';

import glob from 'glob';

import type {
  AboutLibrariesLibraryJsonPayload,
  AboutLibrariesLicenseJsonPayload,
  AggregatedLicensesObj,
  LicensePlistPayload,
} from './types';
import { PackageUtils } from './utils';

/**
 * Scans a single package and its dependencies for license information
 */
function scanPackage(
  packageName: string,
  version: string,
  processedPackages: Set<string>,
  result: AggregatedLicensesObj,
) {
  const packageKey = `${packageName}@${version}`;

  // Skip if already processed to avoid circular dependencies
  if (processedPackages.has(packageKey)) {
    return;
  }

  processedPackages.add(packageKey);

  try {
    const localPackageJsonPath = PackageUtils.getPackageJsonPath(packageName);

    if (!localPackageJsonPath) {
      console.warn(`[react-native-legal] skipping ${packageName} could not find package.json`);
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

    const isWorkspacePackage = version.startsWith('workspace:');

    if (!isWorkspacePackage) return;

    if (dependencies) {
      Object.entries(dependencies).forEach(([depName, depVersion]) => {
        scanPackage(depName, depVersion as string, processedPackages, result);
      });
    }
  } catch (error) {
    console.warn(`[react-native-legal] could not process package.json for ${packageName}`);
  }
}

/**
 * Scans `package.json` and searches for all packages under `dependencies` field. Supports monorepo projects.
 */
export function scanDependencies(appPackageJsonPath: string) {
  const appPackageJson = require(path.resolve(appPackageJsonPath));
  const dependencies: Record<string, string> = appPackageJson.dependencies;
  const result: AggregatedLicensesObj = {};
  const processedPackages = new Set<string>();

  if (dependencies) {
    Object.entries(dependencies).forEach(([packageName, version]) => {
      scanPackage(packageName, version, processedPackages, result);
    });
  }

  return result;
}

function needsQuoting(value: string) {
  return (
    value === '' || // empty string
    /^[#:>|-]/.test(value) || // starts with special char
    /^['"{}[\],&*#?|<>=!%@`]/.test(value) || // starts with indicator chars
    /^[\s]|[\s]$/.test(value) || // has leading/trailing whitespace
    /^[\d.+-]/.test(value) || // looks like a number/bool/null
    /[\n"'\\\s]/.test(value) || // contains newlines, quotes, backslash, or spaces
    /^(true|false|yes|no|null|on|off)$/i.test(value) // is a YAML keyword
  );
}

function formatYamlKey(key: string) {
  return /[@/_.]/.test(key) ? `"${key}"` : key;
}

function formatYamlValue(value: string, indent: number) {
  if (value.includes('\n')) {
    const indentedValue = value
      .split('\n')
      .map((line) => `${' '.repeat(indent)}${line}`)
      .join('\n');

    // Return the block indicator on the same line as the content
    return `|${indentedValue ? '\n' + indentedValue : ''}`;
  }

  if (needsQuoting(value)) {
    if (value.includes("'") && !value.includes('"')) {
      return `"${value.replace(/["\\]/g, '\\$&')}"`;
    }

    return `'${value.replace(/'/g, "''")}'`;
  }

  return value;
}

function toYaml(obj: unknown, indent = 0): string {
  const spaces = ' '.repeat(indent);

  if (obj == null) return '';

  if (Array.isArray(obj)) {
    return obj.map((item) => `${spaces}- ${toYaml(item, indent + 2).trimStart()}`).join('\n');
  }

  if (typeof obj === 'object') {
    return Object.entries(obj)
      .filter(([, v]) => v != null)
      .map(([key, value]) => {
        const formattedKey = formatYamlKey(key);
        const formattedValue = toYaml(value, indent + 2);

        if (Array.isArray(value)) {
          return `${spaces}${formattedKey}:\n${formattedValue}`;
        }

        if (typeof value === 'object' && value !== null) {
          return `${spaces}${formattedKey}:\n${formattedValue}`;
        }

        if (typeof value === 'string' && value.includes('\n')) {
          return `${spaces}${formattedKey}: ${formattedValue}`;
        }

        return `${spaces}${formattedKey}: ${formattedValue}`;
      })
      .join('\n');
  }

  return typeof obj === 'string' ? formatYamlValue(obj, indent) : String(obj);
}

/**
 * Generates LicensePlist-compatible metadata for NPM dependencies as a YAML string.
 *
 * To write a file directly, use `writeLicensePlistNPMOutput` function.
 *
 * @see {@link writeLicensePlistNPMOutput}
 */
export function generateLicensePlistNPMOutput(licenses: AggregatedLicensesObj, iosProjectPath: string) {
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
    toYaml(yamlDoc),
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
 * @see {@link generateLicensePlistNPMOutput}
 */
export function writeLicensePlistNPMOutput(licenses: AggregatedLicensesObj, iosProjectPath: string) {
  const yamlContent = generateLicensePlistNPMOutput(licenses, iosProjectPath);

  fs.writeFileSync(path.join(iosProjectPath, 'license_plist.yml'), yamlContent, { encoding: 'utf-8' });
}

/**
 * Generates AboutLibraries-compatible metadata for NPM dependencies
 *
 * This will take scanned NPM licenses and produce following output inside android project's directory:
 */
export function generateAboutLibrariesNPMOutput(licenses: AggregatedLicensesObj) {
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
 */
export function writeAboutLibrariesNPMOutput(licenses: AggregatedLicensesObj, androidProjectPath: string) {
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

  const aboutLibraries = generateAboutLibrariesNPMOutput(licenses);

  aboutLibraries.forEach(({ normalizedPackageName, libraryJsonPayload, licenseJsonPayload }) => {
    const libraryJsonFilePath = path.join(aboutLibrariesConfigLibrariesDirPath, `${normalizedPackageName}.json`);
    const licenseJsonFilePath = path.join(aboutLibrariesConfigLicensesDirPath, `${licenseJsonPayload.hash}.json`);

    fs.writeFileSync(libraryJsonFilePath, JSON.stringify(libraryJsonPayload));

    if (!fs.existsSync(licenseJsonFilePath)) {
      fs.writeFileSync(licenseJsonFilePath, JSON.stringify(licenseJsonPayload));
    }
  });
}
