# Bare RN Validation Checklist

- Dependency `react-native-legal` exists in app `package.json`.
- `react-native legal-generate` was run from the correct root.
- Android legal metadata exists under `android/config`.
- iOS `Settings.bundle/Root.plist` exists.
- iOS project includes `Generate licenses with LicensePlist` build phase.
- UI entry to the list reachable and displays OSS libraries.
- Exactly one presentation mode is used (native OR custom) unless user explicitly requested both.
- When custom UI is requested, list is sourced from `ReactNativeLegal.getLibrariesAsync()`.
