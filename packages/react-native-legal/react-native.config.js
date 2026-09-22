/** @type {import('@react-native-community/cli-types').Config} */
module.exports = {
  commands: [
    {
      name: 'legal-generate',
      description: 'Set up all native boilerplate for OSS licenses notice',
      options: [
        {
          name: '--dm, --dev-deps-mode <string>',
          description: 'Whether to include devDependencies in the scan',
          parse: (val) => {
            if (val === 'root-only') {
              return val;
            }

            return 'none';
          },
          default: 'none',
        },
        {
          name: '--od, --include-optional-deps [boolean]',
          description:
            'Whether to include optionalDependencies in the scan; includeTransitiveDependencies option applies',
          parse: (val) => val !== 'false',
          default: true,
        },
        {
          name: '--tm, --transitive-deps-mode <string>',
          description: 'Whether transitive dependencies should be scanned',
          parse: (val) => {
            if (val === 'all' || val === 'from-external-only' || val === 'from-workspace-only' || val === 'none') {
              return val;
            }

            return 'all';
          },
          default: 'all',
        },
        {
          name: '--bo, --bundled-only [boolean]',
          description:
            'Narrow the results down to the packages actually bundled by Metro, by reading the bundle dependency graph (runs `metro get-dependencies` or `expo export --source-maps`)',
          parse: (val) => val !== 'false',
          default: false,
        },
        {
          name: '--bs, --bundle-source <string>',
          description:
            "How to obtain the Metro bundle dependency graph (applies only with --bundled-only): 'auto' ('expo' if the project depends on expo, otherwise 'metro'), 'metro', 'expo'",
          parse: (val) => {
            if (val === 'auto' || val === 'metro' || val === 'expo') {
              return val;
            }

            return 'auto';
          },
          default: 'auto',
        },
        {
          name: '--bp, --bundle-platforms <string>',
          description:
            "Comma-separated platforms to resolve the bundle dependency graph for: 'ios', 'android' (applies only with --bundled-only); defaults to the platform being set up",
          parse: (val) =>
            val
              .split(',')
              .map((platform) => platform.trim())
              .filter((platform) => platform === 'ios' || platform === 'android' || platform === 'web'),
        },
        {
          name: '--be, --bundle-entry-file <string>',
          description:
            "Entry file of the bundle, relative to the project root (applies only with --bundled-only and the 'metro' source); defaults to the 'main' field of package.json or index.{js,ts,tsx,jsx}",
        },
      ],
      func: ([], { project: { android, ios } }, args) => {
        const generateLegal = require('./bare-plugin/build').default;
        /** @type {import('./plugin-utils/build/types').PluginScanOptions} */
        const {
          devDepsMode,
          includeOptionalDeps,
          transitiveDepsMode,
          bundledOnly,
          bundleSource,
          bundlePlatforms,
          bundleEntryFile,
        } = args;

        generateLegal(android?.sourceDir, ios?.sourceDir, {
          devDepsMode,
          includeOptionalDeps,
          transitiveDepsMode,
          bundledOnly,
          bundleSource,
          bundlePlatforms,
          bundleEntryFile,
        });
      },
    },
  ],
};
