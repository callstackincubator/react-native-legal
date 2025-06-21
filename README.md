<a href="https://www.callstack.com/open-source?utm_campaign=generic&utm_source=github&utm_medium=referral&utm_content=react-native-legal" align="center">
  <picture>
    <img alt="React Native Legal" src="./images/banner.jpg">
  </picture>
</a>

<p align="center">
  <b>React Native Legal</b> - Automagically generate license acknowledgements for your React Native app 🚀
</p>

---

![Release](https://github.com/callstackincubator/react-native-legal/actions/workflows/release.yml/badge.svg)
![Deploy Docs](https://github.com/callstackincubator/react-native-legal/actions/workflows/deploy-docs.yml/badge.svg)
![Integration tests - License Kit (Node)](https://github.com/callstackincubator/react-native-legal/actions/workflows/test-integration-node.yml/badge.svg)
![Unit tests - React Native Legal Shared](https://github.com/callstackincubator/react-native-legal/actions/workflows/test-unit-shared.yml/badge.svg)
![E2E tests - Android](https://github.com/callstackincubator/react-native-legal/actions/workflows/test-e2e-android.yaml/badge.svg)
![E2E tests - iOS](https://github.com/callstackincubator/react-native-legal/actions/workflows/test-e2e-ios.yaml/badge.svg)

- [Documentation](#documentation)
- [Installation](#installation)
  - [React Native](#react-native)
  - [Standalone CLI](#standalone-cli)
  - [Node.js - API](#nodejs---api)
- [Usage](#usage)
  - [I want to generate licenses in my Expo project ](#i-want-to-generate-licenses-in-my-expo-project-)
  - [I want to generate licenses reports in my bare RN project ](#i-want-to-generate-licenses-reports-in-my-bare-rn-project-)
  - [I want to generate licenses reports in my Node.js project](#i-want-to-generate-licenses-reports-in-my-nodejs-project)
  - [I want to customize the presentation of the licenses in my JS/TS project](#i-want-to-customize-the-presentation-of-the-licenses-in-my-jsts-project)
- [Expo](#expo)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

Automagically generate license acknowledgements for your React Native app and any Node.js project 🚀

| Android                                                                                                       | iOS                                                                                                   | AndroidTV                                                                                                     | tvOS                                                                                               |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| ![Android example](https://github.com/callstackincubator/react-native-legal/raw/main/static/android-expo.gif) | ![iOS example](https://github.com/callstackincubator/react-native-legal/raw/main/static/ios-expo.gif) | ![AndroidTV example](https://github.com/callstackincubator/react-native-legal/raw/main/static/android-tv.gif) | ![tvOS example](https://github.com/callstackincubator/react-native-legal/raw/main/static/tvos.gif) |

## Documentation

You can find the full documentation for all packages in this repository at [callstackincubator.github.io/react-native-legal](https://callstackincubator.github.io/react-native-legal/).

## Installation

### React Native

```sh
yarn add react-native-legal
```

or

```sh
npm i --save react-native-legal
```

### Standalone CLI

```sh
yarn add -D license-kit
```

or

```sh
npm i --save-dev license-kit
```

### Node.js - API

```sh
yarn add -D @callstack/react-native-legal-shared
```

or

```sh
npm i --save-dev @callstack/react-native-legal-shared
```

## Usage

This tool is split into 4 parts:

- a React Native library that lets you display native screen with a list of all dependencies and their licenses
- an [Expo config plugin](https://docs.expo.dev/config-plugins/introduction/?redirected) (for Expo projects) and a [custom community cli plugin](https://github.com/react-native-community/cli/blob/main/docs/plugins.md) (for bare RN projects)
- a standalone CLI tool that can be used in any Node.js project to generate license metadata
- a shared package that exposes the core functionality of the license management tool, allowing customization of presentation logic in your Node.js scripts

### I want to generate licenses in my Expo project <a name="usage-expo"></a>

1. Add the config plugin to the `app.json`/`app.config.js`

```diff
{
  "expo": {
    "plugins": [
+      "react-native-legal"
    ]
  }
}
```

2. Use the library in the codebase

```tsx
import * as React from 'react';
import { Button, View } from 'react-native';
import { ReactNativeLegal } from 'react-native-legal';

function launchNotice() {
  ReactNativeLegal.launchLicenseListScreen('OSS Notice');
}

function MyComponent() {
  return (
    <View>
      <Button onPress={launchNotice} text="Open source licenses" />
    </View>
  );
}
```

3. Use [Prebuild](https://docs.expo.dev/workflow/prebuild/) or [EAS](https://docs.expo.dev/eas/) to build the app

### I want to generate licenses reports in my bare RN project <a name="usage-bare-rn"></a>

1. Invoke the CLI plugin from the root of your RN app

```sh
npx react-native legal-generate
```

or

```sh
yarn react-native legal-generate
```

2. Use the library in the codebase

```tsx
import * as React from 'react';
import { Button, View } from 'react-native';
import { ReactNativeLegal } from 'react-native-legal';

function launchNotice() {
  ReactNativeLegal.launchLicenseListScreen('OSS Notice');
}

function MyComponent() {
  return (
    <View>
      <Button onPress={launchNotice} text="Open source licenses" />
    </View>
  );
}
```

### I want to generate licenses reports in my Node.js project

You can use the `license-kit` CLI tool to generate license reports in your Node.js project. Here's how to do it:

1. Run the CLI tool from the root of your Node.js project:

```sh
npx license-kit report --format markdown --output ./public/licenses.md
```

or

```sh
yarn license-kit report --format markdown --output ./public/licenses.md
```

This will scan your project's dependencies and generate a license report in the specified format (JSON, Markdown, raw text, or AboutLibraries-compatible JSON metadata).

For a list of supported flags and the default values, run `npx license-kit --help` or read them documented [in the package's README](./packages/license-kit/README.md#command-line-options). To read more about a specific command, run `npx license-kit <command> --help`, e.g. `npx license-kit report --help`.

### I want to customize the presentation of the licenses in my JS/TS project

You can use the `@callstack/react-native-legal-shared` package to access the core functionalities of the license management tool. To do so, please read the [programmatic usage documentation](https://callstackincubator.github.io/react-native-legal/docs/programmatic-usage#usage).

## Expo

- ✅ You can use this library with [Development Builds](https://docs.expo.dev/development/introduction/) by adding `react-native-legal` to your `app.json`/`app.config.js` plugins array.
- ❌ This library can't be used in the "Expo Go" app because it [requires custom native code](https://docs.expo.dev/workflow/customizing/).

## Contributing

See the [contributing guide](./CONTRIBUTING) to learn how to contribute to the repository and the development workflow.

## Acknowledgements

- [AboutLibraries](https://github.com/mikepenz/AboutLibraries) - collects and displays the license metadata for the Android app <3
- [LicensePlist](https://github.com/mono0926/LicensePlist) - generates license metadata for the iOS app <3

## License

MIT
