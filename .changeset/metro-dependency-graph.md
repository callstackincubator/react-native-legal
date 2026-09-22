---
'@callstack/licenses': minor
'license-kit': minor
'react-native-legal': minor
---

feat: narrow scanned licenses down to the packages actually bundled by Metro, by reading the Metro dependency graph (`metro get-dependencies` / `expo export --source-maps`)

- `@callstack/licenses`: new `BundleGraphUtils` namespace (`getBundledPackages`, `filterLicensesByBundledPackages`, ...) and `scanBundledDependencies` helper
- `license-kit`: new `--bundled-only`, `--bundle-source`, `--bundle-platforms` & `--bundle-entry-file` flags for `report`, `copyleft`, `analyze` & `visualize`
- `react-native-legal`: new `bundledOnly`, `bundleSource`, `bundlePlatforms` & `bundleEntryFile` Expo plugin options and `--bundled-only`, `--bundle-source`, `--bundle-platforms` & `--bundle-entry-file` flags for `legal-generate`; the graph is resolved per platform (iOS project lists packages bundled for iOS, Android project - for Android)
