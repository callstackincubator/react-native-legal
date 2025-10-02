const fs = require('node:fs');
const path = require('node:path');

const { scanDependencies } = require('@callstack/licenses');

const { createPluginScanOptionsFactory } = require('../../plugin-utils/build/common');

/**
 * @param {import('commander').Command} program
 * @returns {import('commander').Command}
 */
function generateLegal(program) {
  return program
    .command('legal-generate')
    .description('Set up all native boilerplate for OSS licenses notice')
    .option(
      '--tm, --transitive-deps-mode [mode]',
      'Controls, which transitive dependencies are included:' +
        `\n\u2063\t- 'all',` +
        `\n\u2063\t- 'from-external-only' (only transitive dependencies of direct dependencies specified by non-workspace:... specifiers),` +
        `\n\u2063\t- 'from-workspace-only' (only transitive dependencies of direct dependencies specified by \`workspace:\` specifier),` +
        `\n\u2063\t- 'none'` +
        '\n', // newline for auto-description of the default value
      (val) => {
        if (val === 'all' || val === 'from-external-only' || val === 'from-workspace-only' || val === 'none') {
          return val;
        }

        return 'all';
      },
      'all',
    )
    .option(
      '--dm, --dev-deps-mode [mode]',
      'Controls, whether and how development dependencies are included:' +
        `\n\u2063\t- 'root-only' (only direct devDependencies from the scanned project's root package.json)` +
        `\n\u2063\t- 'none'` +
        '\n', // newline for auto-description of the default value
      (val) => {
        if (val === 'root-only') {
          return val;
        }

        return 'none';
      },
      'none',
    )
    .option(
      '--od, --include-optional-deps [include]',
      'Whether to include optionalDependencies in the scan; other flags apply',
      (val) => val !== 'false',
      true,
    )
    .action((options) => {
      const repoRootPath = path.resolve(process.cwd());
      const packageJsonPath = path.join(repoRootPath, 'package.json');

      if (!fs.existsSync(packageJsonPath)) {
        console.error(`package.json not found at ${packageJsonPath}`);
        process.exit(1);
      }

      /** @type {import('../plugin-utils/build/types').PluginScanOptions} */
      const { devDepsMode, includeOptionalDeps, transitiveDepsMode } = options;

      const scanOptionsFactory = createPluginScanOptionsFactory({
        devDepsMode,
        includeOptionalDeps,
        transitiveDepsMode,
      });

      const licenses = scanDependencies(packageJsonPath, scanOptionsFactory);

      const payload = Object.entries(licenses)
        .map(([packageKey, licenseObj]) => {
          return {
            name: licenseObj.name,
            version: licenseObj.version,
            content: licenseObj.content ?? licenseObj.type ?? 'UNKNOWN',
            packageKey,
            ...(licenseObj.url && { source: licenseObj.url }),
          };
        })
        .toSorted((first, second) => {
          if (!first.version || !second.version) {
            return first.name > second.name;
          }

          if (first.name !== second.name) {
            return first.name > second.name ? 1 : -1;
          }

          const [firstMajor, firstMinor, firstPatch] = first.version.split('.').filter(Boolean);
          const [secondMajor, secondMinor, secondPatch] = second.version.split('.').filter(Boolean);

          return `${first.name}.${firstMajor.padStart(10, '0')}.${(firstMinor ?? '0').padStart(10, '0')}.${(
            firstPatch ?? '0'
          ).padStart(10, '0')}` >
            `${second.name}.${secondMajor.padStart(10, '0')}.${(secondMinor ?? '0').padStart(10, '0')}.${(
              secondPatch ?? '0'
            ).padStart(10, '0')}`
            ? 1
            : -1;
        });

      const rnLegalConfigPath = path.join(__dirname, '..', '..', '.rnlegal');

      if (!fs.existsSync(rnLegalConfigPath)) {
        fs.mkdirSync(rnLegalConfigPath);
      }

      const rnLegalConfigLibrariesPath = path.join(rnLegalConfigPath, 'libraries.json');

      fs.writeFileSync(rnLegalConfigLibrariesPath, JSON.stringify(payload), { encoding: 'utf-8' });

      console.log(`✅ Output written to ${rnLegalConfigLibrariesPath}`);
    });
}

module.exports = generateLegal;
