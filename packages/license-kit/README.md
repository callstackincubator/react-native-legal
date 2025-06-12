# license-kit

A CLI for managing and analyzing Open Source Software (OSS) licenses in your Node.js projects. This package helps you aggregate license information and ensure compliance with license requirements.

## Features

- 🔍 Scan and aggregate license information from your project dependencies
- ⚠️ Detect copyleft licenses that might affect your project
- 📝 Generate license reports
- 🔄 Support for both direct and transitive dependencies

## Installation

```bash
npm install license-kit
```

## Quick Start

Run the license check in your project root:

```bash
npx license-kit
```

## Usage

### Basic Usage

```bash
# Run with default settings
npx license-kit

# Check for copyleft licenses
npx license-kit --copyleft

# Exit on weak copyleft licenses
npx license-kit --error-on-weak
```

### Command Line Options

| Option            | Description                                                                         | Default                   |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| `--copyleft`      | Check for copyleft licenses. Exits with error if strong copyleft licenses are found | `false`                   |
| `--error-on-weak` | Exit with error if weak copyleft licenses are found                                 | `false`                   |
| `--root`          | Path to the root of your project                                                    | Current working directory |
| `--help`          | Show help message                                                                   | -                         |

## License Types

The tool recognizes various license types:

- **Strong Copyleft**: Licenses that require derivative works to be released under the same license (e.g., GPL-3.0)
- **Weak Copyleft**: Licenses that require derivative works to be released under the same license, but with some exceptions (e.g., LGPL-3.0)
- **Permissive**: Licenses that allow for more flexible use (e.g., MIT, Apache-2.0)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development workflow
- Code style
- Pull request process
- Testing requirements

To build the project, run `yarn build-library`. This will compile the TypeScript code into JavaScript and prepare the package for distribution.

To run the project in development mode, use `yarn dev`. This will run the TypeScript entrypoint with node directly.

## License

MIT © [Callstack](https://callstack.com)
