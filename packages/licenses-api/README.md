<a href="https://www.callstack.com/open-source?utm_campaign=generic&utm_source=github&utm_medium=referral&utm_content=@callstack/licenses" align="center">
  <picture>
    <img alt="Licenses" src="https://github.com/callstackincubator/react-native-legal/blob/main/images/licenses-banner.jpg">
  </picture>
</a>

# @callstack/licenses

![Release](https://github.com/callstackincubator/react-native-legal/actions/workflows/release.yml/badge.svg)
![Deploy Docs](https://github.com/callstackincubator/react-native-legal/actions/workflows/deploy-docs.yml/badge.svg)
![Unit tests - @callstack/licenses](https://github.com/callstackincubator/react-native-legal/actions/workflows/test-unit-licenses-api.yml/badge.svg)

API package that exposes functionalities for programmatic scanning of licenses in Node.js projects. It is used by the `license-kit` CLI tool and can be used directly in your Node.js scripts.

## Features

- 🔍 Scan and aggregate license information from your project dependencies
- 📝 Generate license reports in a format of choice (JSON, Markdown, raw text, AboutLibraries-compatible JSON metadata)
- 🔄 Support for both direct and transitive dependencies

## Installation

```bash
npm install @callstack/licenses
```

## Programmatic Usage

You can use `@callstack/licenses` programmatically in your Node.js applications. Here's a basic example of how to use it:

```typescript
import {
  Types,
  generateAboutLibrariesNPMOutput,
  generateLicensePlistNPMOutput,
  scanDependencies,
} from '@callstack/licenses';
import * as md from 'ts-markdown-builder';

// apart from dependencies, also include devDependencies, but only from the root package.json;
// also, include all transitive dependencies & optional dependencies
const optionsFactory: Types.ScanPackageOptionsFactory = ({ isRoot }) => ({
  includeDevDependencies: isRoot,
  includeTransitiveDependencies: true,
  includeOptionalDependencies: true,
});

// scan dependencies of a package
const licenses = scanDependencies(packageJsonPath, optionsFactory);

// generate AboutLibraries-compatible JSON metadata
const aboutLibrariesCompatibleReport = generateAboutLibrariesNPMOutput(licenses);

// generate LicensePlist-compatible metadata
const licensePlistReport = generateLicensePlistNPMOutput(licenses, iosProjectPath);

// generate a Markdown report
const markdownString = md
  .joinBlocks(
    Object.entries(licenses)
      .flatMap(([packageKey, { name: packageName, version, author, content, description, file, type, url }]) => [
        md.heading(packageName, { level: 2 }),
        '\n',
        `Version: ${version}<br/>\n`,
        url ? `URL: ${url}<br/>\n` : '',
        author ? `Author: ${author}<br/>\n\n` : '',
        content ?? '',
        '\n',
        description ? `Description: ${description}\n` : '',
        file ? `\nFile: ${file}\n` : '',
        type ? `Type: ${type}` : '',
        '\n',
        md.horizontalRule,
      ])
      .join('\n'),
  )
  .toString();
```

## API Documentation

The API documentation is published under: https://callstackincubator.github.io/react-native-legal/api/.

## Contributing

This package is consumed by other packages in the monorepo by its build outputs, so everytime it is modified, you need to rebuild the package. This can be done once by running `yarn build`, or by running `yarn dev` to run `tsc` in watch mode. All this is described in the [Contributing Guide](../../CONTRIBUTING.md).
