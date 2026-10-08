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
          name: '--apr, --additional-project-roots <paths>',
          description:
            'Comma-separated paths (relative to the app root) of other folders with a package.json whose dependencies should be listed too, e.g. monorepo workspaces the app does not depend on; can be repeated',
          parse: (val, previous) => [...previous, ...val.split(',').map((rootPath) => rootPath.trim())],
          default: () => [],
        },
      ],
      func: ([], { project: { android, ios } }, args) => {
        const generateLegal = require('./bare-plugin/build').default;
        /** @type {import('./plugin-utils/build/types').PluginScanOptions} */
        const { devDepsMode, includeOptionalDeps, transitiveDepsMode, additionalProjectRoots } = args;

        generateLegal(android?.sourceDir, ios?.sourceDir, {
          devDepsMode,
          includeOptionalDeps,
          transitiveDepsMode,
          additionalProjectRoots,
        });
      },
    },
  ],
};
