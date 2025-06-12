# @callstack/react-native-legal-shared

## Features

- 🔍 Scan and aggregate license information from your project dependencies
- 📝 Generate license reports in a format of choice (JSON, Markdown, raw text, AboutLibraries-compatible JSON metadata)
- 🔄 Support for both direct and transitive dependencies

## Installation

```bash
npm install @callstack/react-native-legal-shared
```

## Programmatic Usage

You can use `@callstack/react-native-legal-shared` programmatically in your Node.js applications. Here's a basic example of how to use it:

```typescript
import {
  generateAboutLibrariesNPMOutput,
  generateLicensePlistNPMOutput,
  scanDependencies,
} from '@callstack/react-native-legal-shared';

// scan dependencies of a package
const licenses = scanDependencies(packageJsonPath);

// generate AboutLibraries-compatible JSON metadata
const aboutLibrariesCompatibleReport = generateAboutLibrariesNPMOutput(licenses);

// generate LicensePlist-compatible metadata
const licensePlistReport = generateLicensePlistNPMOutput(licenses);

// generate a Markdown report
const markdownString = md
  .joinBlocks(
    Object.entries(licenses)
      .flatMap(([packageName, { version, author, content, description, file, type, url }]) => [
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

The API documentation is published under: https://callstackincubator.github.io/react-native-legal/docs/api/.

## Contributing

This package is consumed by other packages in the monorepo by its build outputs, so everytime it is modified, you need to rebuild the package. This can be done once by running `yarn build`, or by running `yarn dev` to run `tsc` in watch mode. All this is described in the [Contributing Guide](../../CONTRIBUTING.md).
