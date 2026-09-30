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
          name: '--ds, --dependency-source <string>',
          description:
            'How the dependencies are determined: from package.json files or from the Metro dependency graph',
          parse: (val) => {
            if (val === 'metro') {
              return val;
            }

            return 'package-json';
          },
          default: 'package-json',
        },
      ],
      func: ([], { project: { android, ios } }, args) => {
        const generateLegal = require('./bare-plugin/build').default;
        /** @type {import('./plugin-utils/build/types').PluginScanOptions} */
        const { devDepsMode, includeOptionalDeps, transitiveDepsMode, dependencySource } = args;

        return generateLegal(android?.sourceDir, ios?.sourceDir, {
          devDepsMode,
          includeOptionalDeps,
          transitiveDepsMode,
          dependencySource,
        });
      },
    },
  ],
};
