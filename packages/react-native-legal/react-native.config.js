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
          name: '--al, --about-libraries-github-api-token <string>',
          description: 'GitHub API token used by AboutLibraries to resolve metadata',
          parse: (val) => val,
        },
        {
          name: '--github-token <string>',
          description: 'GitHub token passed to LicensePlist (helps avoid rate limits)',
          parse: (val) => val,
        },
        {
          name: '--add-version-numbers [boolean]',
          description: 'Whether LicensePlist should add version numbers to entries',
          parse: (val) => val !== 'false',
          default: true,
        },
      ],
      func: ([], { project: { android, ios } }, args) => {
        const generateLegal = require('./bare-plugin/build').default;
        /** @type {import('./plugin-utils/build/types').PluginOptions} */
        const {
          devDepsMode,
          includeOptionalDeps,
          transitiveDepsMode,
          aboutLibrariesGithubApiToken,
          githubToken,
          addVersionNumbers,
        } = args;

        generateLegal(android?.sourceDir, ios?.sourceDir, {
          devDepsMode,
          includeOptionalDeps,
          transitiveDepsMode,
          aboutLibraries: aboutLibrariesGithubApiToken ? { gitHubApiToken: aboutLibrariesGithubApiToken } : undefined,
          licensePlist: { githubToken, addVersionNumbers },
        });
      },
    },
  ],
};
