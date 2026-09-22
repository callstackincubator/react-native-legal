<a href="https://www.callstack.com/open-source?utm_campaign=generic&utm_source=github&utm_medium=referral&utm_content=license-kit" align="center">
  <picture>
    <img alt="License Kit" src="https://github.com/callstackincubator/react-native-legal/blob/main/images/license-kit-banner.jpg">
  </picture>
</a>

<p align="center">
  <b>License Kit</b> - Aggregate license notes of OSS libraries used in your Node.js project, analyze & visualize OSS licenses with AI-turbocharged tooling 🚀
</p>

![Release](https://github.com/callstackincubator/react-native-legal/actions/workflows/release.yml/badge.svg)
![Deploy Docs](https://github.com/callstackincubator/react-native-legal/actions/workflows/deploy-docs.yml/badge.svg)
![Integration tests - License Kit (Node)](https://github.com/callstackincubator/react-native-legal/actions/workflows/test-integration-node.yml/badge.svg)

A CLI for managing and analyzing Open Source Software (OSS) licenses in your Node.js projects. This package helps you aggregate license information and ensure compliance with license requirements.

## Features

- 🔍 Scan and aggregate license information from your project dependencies
- ⚠️ Detect copyleft licenses that might affect your project (`copyleft` command)
- 📝 Generate license reports in a format of choice (JSON, Markdown, raw text, AboutLibraries-compatible JSON metadata) with the `report` command
- 🔄 Support for both direct and transitive dependencies
- 🧮 Analyze the license types in your project (`analyze` command)
- Get insights into the used licenses with 📈 graphs and 🤖 AI-turbocharged summary of the state of your dependencies' licenses (`visualize` command)

## Installation

```bash
npm install -D license-kit
```

## Quick Start

Run the license check in your project root:

```bash
npx license-kit
```

## Usage

### Basic Usage

```bash
# Generate licenses report with default settings (JSON, stdout)
npx license-kit report

# Generate licenses report in Markdown format and write to ./public/licenses.md
npx license-kit report --format markdown --output ./public/licenses.md

# Write a text report to ./public/licenses.txt of a different project
npx license-kit report --format markdown --output ../../out/licenses.md --root ../../another-project

# Check for copyleft licenses
npx license-kit copyleft

# Exit on weak copyleft licenses
npx license-kit copyleft --error-on-weak

# Print help for the report command
npx license-kit report --help

# Print help for the copyleft command
npx license-kit copyleft --help
```

### Command Line Options

#### Command: `copyleft`

Check for copyleft licenses. Exits with error code (≠ 0) if strong copyleft licenses are found. Can be configured to exit with non-zero exit code if weak copyleft licenses are found as well.

Exit codes:

- `0` - no copyleft licenses found
- `1` - strong copyleft licenses found
- `2` - weak copyleft licenses found (if `--error-on-weak` is set)

| Flag / Option                             | Description                                                                                                                                                                                                                                                                                                                                              | Default                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `--tm, --transitive-deps-mode [mode]`     | Controls, which transitive dependencies are included: <ul><li>`'all'`</li> <li>`'from-external-only'` (only transitive dependencies of direct dependencies specified by non-workspace:... specifiers)</li> <li>`'from-workspace-only'` (only direct dependencies of direct dependencies specified by `workspace:` specifier)</li> <li>`'none'`</li></ul> | `'all'`                   |
| `--dm, --dev-deps-mode [mode]`            | <ul><li>`'root-only'` (only direct devDependencies from the scanned project's root package.json)</li> <li>`'none'`</li></ul>                                                                                                                                                                                                                             | `'root-only'`             |
| `--od, --include-optional-deps [include]` | Whether to include optionalDependencies in the scan; other flags apply                                                                                                                                                                                                                                                                                   | `true`                    |
| `--bundled-only`                          | Narrow the results down to the packages actually bundled by Metro, by reading the bundle dependency graph (see [Bundled packages only](#bundled-packages-only))                                                                                                                                                                                          | `false`                   |
| `--bundle-source [source]`                | How to obtain the Metro bundle dependency graph (applies only with `--bundled-only`): <ul><li>`'auto'` (`'expo'` if the project depends on `expo`, otherwise `'metro'`)</li> <li>`'metro'` (`metro get-dependencies`)</li> <li>`'expo'` (`expo export --source-maps`)</li></ul>                                                                          | `'auto'`                  |
| `--bundle-platforms [platforms]`          | Comma-separated platforms to resolve the bundle dependency graph for: `'ios'`, `'android'`, `'web'` (applies only with `--bundled-only`)                                                                                                                                                                                                                 | `'ios,android'`           |
| `--bundle-entry-file [path]`              | Entry file of the bundle, relative to the project root (applies only with `--bundled-only` and the `'metro'` source); defaults to the `main` field of `package.json` or `index.{js,ts,tsx,jsx}`                                                                                                                                                          | —                         |
| `--root [path]`                           | Path to the root of your project                                                                                                                                                                                                                                                                                                                         | Current working directory |
| `--error-on-weak`                         | Exit with error code if weak copyleft licenses are found                                                                                                                                                                                                                                                                                                 | `false`                   |

#### Command: `report`

Generates a licenses report in the specified format. The output can be written to `stdout` (default) or a file.

| Flag / Option                             | Description                                                                                                                                                                                                                                                                                                                                              | Default                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `--tm, --transitive-deps-mode [mode]`     | Controls, which transitive dependencies are included: <ul><li>`'all'`</li> <li>`'from-external-only'` (only transitive dependencies of direct dependencies specified by non-workspace:... specifiers)</li> <li>`'from-workspace-only'` (only direct dependencies of direct dependencies specified by `workspace:` specifier)</li> <li>`'none'`</li></ul> | `'all'`                   |
| `--dm, --dev-deps-mode [mode]`            | <ul><li>`'root-only'` (only direct devDependencies from the scanned project's root package.json)</li> <li>`'none'`</li></ul>                                                                                                                                                                                                                             | `'root-only'`             |
| `--od, --include-optional-deps [include]` | Whether to include optionalDependencies in the scan; other flags apply                                                                                                                                                                                                                                                                                   | `true`                    |
| `--bundled-only`                          | Narrow the results down to the packages actually bundled by Metro, by reading the bundle dependency graph (see [Bundled packages only](#bundled-packages-only))                                                                                                                                                                                          | `false`                   |
| `--bundle-source [source]`                | How to obtain the Metro bundle dependency graph (applies only with `--bundled-only`): <ul><li>`'auto'` (`'expo'` if the project depends on `expo`, otherwise `'metro'`)</li> <li>`'metro'` (`metro get-dependencies`)</li> <li>`'expo'` (`expo export --source-maps`)</li></ul>                                                                          | `'auto'`                  |
| `--bundle-platforms [platforms]`          | Comma-separated platforms to resolve the bundle dependency graph for: `'ios'`, `'android'`, `'web'` (applies only with `--bundled-only`)                                                                                                                                                                                                                 | `'ios,android'`           |
| `--bundle-entry-file [path]`              | Entry file of the bundle, relative to the project root (applies only with `--bundled-only` and the `'metro'` source); defaults to the `main` field of `package.json` or `index.{js,ts,tsx,jsx}`                                                                                                                                                          | —                         |
| `--root [path]`                           | Path to the root of your project                                                                                                                                                                                                                                                                                                                         | Current working directory |
| `--format [type]`                         | Output format, one of: `'json'`, `'about-json'` (AboutLibraries-compatible), `'text'`, `'markdown'`                                                                                                                                                                                                                                                      | `'json'`                  |
| `--output [path]`                         | Where to write the output - either `'stdout'` or a path to an output file                                                                                                                                                                                                                                                                                | `'stdout'`                |

#### Command: `analyze`

Scan licenses & report the insights: summary, top license types, optionally unknowns & breakdown of licenses by different features.

| Flag / Option                            | Description                                                                                                                                                                                                                                                                                                                                              | Default                   |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `--root [path]`                          | Path to the root of your project.                                                                                                                                                                                                                                                                                                                        | Current working directory |
| `--list-unknown`                         | List unknown licenses.                                                                                                                                                                                                                                                                                                                                   | `false`                   |
| `--show-breakdown`                       | Show breakdown of licenses by category and type.                                                                                                                                                                                                                                                                                                         | `false`                   |
| `--tm, --transitive-deps-mode [mode]`    | Controls, which transitive dependencies are included: <ul><li>`'all'`</li> <li>`'from-external-only'` (only transitive dependencies of direct dependencies specified by non-workspace:... specifiers)</li> <li>`'from-workspace-only'` (only direct dependencies of direct dependencies specified by `workspace:` specifier)</li> <li>`'none'`</li></ul> | `'all'`                   |
| `--dm, --dev-deps-mode [mode]`           | <ul><li>`'root-only'` (only direct devDependencies from the scanned project's root package.json)</li> <li>`'none'`</li></ul>                                                                                                                                                                                                                             | `'root-only'`             |
| `--od`, `--include-optional-deps [bool]` | Whether to include `optionalDependencies` in the scan; other flags apply.                                                                                                                                                                                                                                                                                | `true`                    |
| `--bundled-only`                         | Narrow the results down to the packages actually bundled by Metro, by reading the bundle dependency graph (see [Bundled packages only](#bundled-packages-only))                                                                                                                                                                                          | `false`                   |
| `--bundle-source [source]`               | How to obtain the Metro bundle dependency graph (applies only with `--bundled-only`): <ul><li>`'auto'` (`'expo'` if the project depends on `expo`, otherwise `'metro'`)</li> <li>`'metro'` (`metro get-dependencies`)</li> <li>`'expo'` (`expo export --source-maps`)</li></ul>                                                                          | `'auto'`                  |
| `--bundle-platforms [platforms]`         | Comma-separated platforms to resolve the bundle dependency graph for: `'ios'`, `'android'`, `'web'` (applies only with `--bundled-only`)                                                                                                                                                                                                                 | `'ios,android'`           |
| `--bundle-entry-file [path]`             | Entry file of the bundle, relative to the project root (applies only with `--bundled-only` and the `'metro'` source); defaults to the `main` field of `package.json` or `index.{js,ts,tsx,jsx}`                                                                                                                                                          | —                         |
| `-h`, `--help`                           | Display help for command.                                                                                                                                                                                                                                                                                                                                | —                         |

#### Command: `visualize`

Launches a local server providing a web license graph visualizer & analyzer app: summarizes the dependency graph state, shows an interactive graph of licenses with possibility to select a subgraph, provides browser built-in AI-turbocharged summary of the dependency graph.

| Flag / Option                            | Description                                                                                                                                                                                                                                                                                                                                              | Default         |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `--port [port]`                          | Port on which to launch the app.                                                                                                                                                                                                                                                                                                                         | `8094`          |
| `--h, --host [host]`                     | Host on which to launch the app.                                                                                                                                                                                                                                                                                                                         | `"localhost"`   |
| `--a, --auto-open [open]`                | Automatically open the app in the browser after launching.                                                                                                                                                                                                                                                                                               | `true`          |
| `--root [path]`                          | Path to the root of your project.                                                                                                                                                                                                                                                                                                                        | `"."`           |
| `--tm, --transitive-deps-mode [mode]`    | Controls, which transitive dependencies are included: <ul><li>`'all'`</li> <li>`'from-external-only'` (only transitive dependencies of direct dependencies specified by non-workspace:... specifiers)</li> <li>`'from-workspace-only'` (only direct dependencies of direct dependencies specified by `workspace:` specifier)</li> <li>`'none'`</li></ul> | `'all'`         |
| `--dm, --dev-deps-mode [mode]`           | <ul><li>`'root-only'` (only direct devDependencies from the scanned project's root package.json)</li> <li>`'none'`</li></ul>                                                                                                                                                                                                                             | `'root-only'`   |
| `--od`, `--include-optional-deps [bool]` | Whether to include `optionalDependencies` in the scan; other flags apply.                                                                                                                                                                                                                                                                                | `true`          |
| `--bundled-only`                         | Narrow the results down to the packages actually bundled by Metro, by reading the bundle dependency graph (see [Bundled packages only](#bundled-packages-only))                                                                                                                                                                                          | `false`         |
| `--bundle-source [source]`               | How to obtain the Metro bundle dependency graph (applies only with `--bundled-only`): <ul><li>`'auto'` (`'expo'` if the project depends on `expo`, otherwise `'metro'`)</li> <li>`'metro'` (`metro get-dependencies`)</li> <li>`'expo'` (`expo export --source-maps`)</li></ul>                                                                          | `'auto'`        |
| `--bundle-platforms [platforms]`         | Comma-separated platforms to resolve the bundle dependency graph for: `'ios'`, `'android'`, `'web'` (applies only with `--bundled-only`)                                                                                                                                                                                                                 | `'ios,android'` |
| `--bundle-entry-file [path]`             | Entry file of the bundle, relative to the project root (applies only with `--bundled-only` and the `'metro'` source); defaults to the `main` field of `package.json` or `index.{js,ts,tsx,jsx}`                                                                                                                                                          | —               |
| `-h`, `--help`                           | Display help for command.                                                                                                                                                                                                                                                                                                                                | —               |

### Bundled packages only

By default, all packages found in the dependency tree of your `package.json` (according to the scan flags) are reported - including packages that are never imported by your JS bundle (e.g. build tooling, Babel plugins or Node.js-only helpers).

For React Native / Expo projects, the `--bundled-only` flag makes the CLI read the **Metro dependency graph** and keep only the packages whose modules actually end up in the JS bundle. Depending on `--bundle-source`, the graph is obtained by running, in the project root:

- `metro get-dependencies` for bare React Native projects (the project's `metro.config.js` is respected), or
- `expo export --source-maps` for Expo projects (the bundled modules are read from the emitted source maps).

The graph is resolved for a production bundle and for each of `--bundle-platforms` (union of the results).

```bash
# Report only the packages bundled by Metro for iOS & Android
npx license-kit report --bundled-only

# Check copyleft licenses only among the packages bundled for Android, using a custom Metro entry file
npx license-kit copyleft --bundled-only --bundle-source metro --bundle-platforms android --bundle-entry-file src/index.ts
```

Reading the dependency graph requires a full Metro resolution of the bundle (or a full `expo export`), so the command will take noticeably longer.

#### Command: `help`

Displays help, listing the available commands.

#### General options

General options that can be passed to the CLI with after any command.

| Option      | Description                     |
| ----------- | ------------------------------- |
| `--version` | Outputs the version of the CLI. |
| `--help`    | Displays help for the command.  |

## License Types

The tool recognizes various license types:

- **Strong Copyleft**: Licenses that require derivative works to be released under the same license (e.g., GPL-3.0)
- **Weak Copyleft**: Licenses that require derivative works to be released under the same license, but with some exceptions (e.g., LGPL-3.0)
- **Permissive**: Licenses that allow for more flexible use (e.g., MIT, Apache-2.0)
- **Unknown**: Packages that have not specified the license type they are licensed under in their `package.json`

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development workflow
- Code style
- Pull request process
- Testing requirements

To build the project, run `yarn build-library`. This will compile the TypeScript code into JavaScript and prepare the package for distribution.

To run the project in development mode, use `yarn dev`. This will run the TypeScript entrypoint with node directly.

### Appendix - package structure

This package contains a Next.js `@callstack/license-kit-visualizer` within it. It integrates a Next.js server with express server, in development mode compiling the `visualizer/` directory, while in production mode (when the package is published / ran with `NODE_ENV=production` for the sake of testing), it serves a prebuilt Next.js app from `visualizer-build/` directory, which in turn is configured to be the Next.js output directory in `next.config.js`. This output directory is also included in the `files` section of `license-kit`'s `package.json`, effectively including the prebuild app in the published tarball of this package.

## License

MIT © [Callstack](https://callstack.com)
