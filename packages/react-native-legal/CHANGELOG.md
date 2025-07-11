# react-native-legal

## 1.3.1

### Patch Changes

- [#66](https://github.com/callstackincubator/react-native-legal/pull/66) [`9534b4c`](https://github.com/callstackincubator/react-native-legal/commit/9534b4c053cf62d90b2772b5ecf30833bd20ae24) Thanks [@artus9033](https://github.com/artus9033)! - Migrated to new API package - @callstack/licenses

- Updated dependencies [[`9534b4c`](https://github.com/callstackincubator/react-native-legal/commit/9534b4c053cf62d90b2772b5ecf30833bd20ae24)]:
  - @callstack/licenses@0.2.1

## 1.3.0

### Minor Changes

- [#44](https://github.com/callstackincubator/react-native-legal/pull/44) [`4ebed78`](https://github.com/callstackincubator/react-native-legal/commit/4ebed78ed8cf95625df6c3211598cfe5db807b09) Thanks [@thymikee](https://github.com/thymikee)! - Consume extracted core logic from @callstack/react-native-legal-shared

- [#56](https://github.com/callstackincubator/react-native-legal/pull/56) [`55f23b6`](https://github.com/callstackincubator/react-native-legal/commit/55f23b6d18858aacae76b9fe31e3f75fe2ef468c) Thanks [@artus9033](https://github.com/artus9033)! - Support for scanning of conflicting versions of installed libraries, fixed missing links on screen items on Android

### Patch Changes

- [#42](https://github.com/callstackincubator/react-native-legal/pull/42) [`e5a79a6`](https://github.com/callstackincubator/react-native-legal/commit/e5a79a6a9d799746d25c63d1e3aa4e245c719fee) Thanks [@wjaszczuk](https://github.com/wjaszczuk)! - Fix: plugin throws an error when user uses bare rn app and one of platform is missing

- [#40](https://github.com/callstackincubator/react-native-legal/pull/40) [`58a46f1`](https://github.com/callstackincubator/react-native-legal/commit/58a46f1ba1319d2755469631a55bb367f321b7cf) Thanks [@wjaszczuk](https://github.com/wjaszczuk)! - RN Legal plugin will remove Settings.bundle from XCode project, and add it again

- Updated dependencies [[`e89ba1f`](https://github.com/callstackincubator/react-native-legal/commit/e89ba1ff8fc1d8182a287cc257182a2d55374d95), [`4ebed78`](https://github.com/callstackincubator/react-native-legal/commit/4ebed78ed8cf95625df6c3211598cfe5db807b09), [`55f23b6`](https://github.com/callstackincubator/react-native-legal/commit/55f23b6d18858aacae76b9fe31e3f75fe2ef468c), [`b644f22`](https://github.com/callstackincubator/react-native-legal/commit/b644f22f57657afa999c20059ce02b3e7ba71cfb), [`4ebed78`](https://github.com/callstackincubator/react-native-legal/commit/4ebed78ed8cf95625df6c3211598cfe5db807b09)]:
  - @callstack/react-native-legal-shared@0.2.0

## 1.2.0

### Minor Changes

- [#35](https://github.com/callstackincubator/react-native-legal/pull/35) [`8a892a5`](https://github.com/callstackincubator/react-native-legal/commit/8a892a5819c80350e784b555a614334333a4e0d5) Thanks [@shovel-kun](https://github.com/shovel-kun)! - Adjusts ReactNativeLegalActivity to automatically switch appearance to dark or light depending on Android device theme

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
