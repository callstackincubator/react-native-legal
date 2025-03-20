# react-native-legal

## 1.1.1

### Patch Changes

- [#29](https://github.com/callstackincubator/react-native-legal/pull/29) [`1417a01`](https://github.com/callstackincubator/react-native-legal/commit/1417a01dbd66034299de06117cd608d282c167d7) Thanks [@piotrski](https://github.com/piotrski)! - Fixes an issue where licenses with unusual indentation caused YAML errors, breaking the LicencePlist script during the build. This ensures proper processing and prevents build failures.

## 1.1.0

### Minor Changes

- [#24](https://github.com/callstackincubator/react-native-legal/pull/24) [`9c696c2`](https://github.com/callstackincubator/react-native-legal/commit/9c696c2ceb7daaddec5b285df5b25eb08f121c4e) Thanks [@piotrski](https://github.com/piotrski)! - License scanning now includes dependencies of `workspace:*` packages, not just the app's direct dependencies.

### Patch Changes

- [#21](https://github.com/callstackincubator/react-native-legal/pull/21) [`483df89`](https://github.com/callstackincubator/react-native-legal/commit/483df8975380b6db15e2710f1be676fd43971d2b) Thanks [@mateusz1913](https://github.com/mateusz1913)! - fix(#19): library support for ios use_frameworks

## 1.0.0

### Major Changes

- [#12](https://github.com/callstackincubator/react-native-legal/pull/12) [`9e76909`](https://github.com/callstackincubator/react-native-legal/commit/9e76909194bb2201362f9a44bf7f7d3ef5ec161b) Thanks [@piotrski](https://github.com/piotrski)! - Initial release of `react-native-legal` 🎉

  - Full support for both iOS and Android platforms, including tvOS and AndroidTV
  - Native platform integration using LicensePlist (iOS) and AboutLibraries (Android)
  - Automatic dependency scanning and license information generation
  - Seamless integration with Expo projects via Config Plugin
  - React Native CLI support via custom command for bare workflow
  - Native screens for displaying license acknowledgements
  - Simple API for launching license list screen
  - Zero configuration needed for basic usage
