---
'@callstack/licenses': minor
'react-native-legal': minor
---

Add the `dependencySource` option (`--dependency-source` flag of the `legal-generate` command, `dependencySource` option of the Expo plugin) that selects how the JS dependencies added to the native license screens are determined: `'package-json'` (default, the current behavior - scanning `package.json` files) or `'metro'` (only packages included in the Metro dependency graph of the app). Combining `'metro'` with `devDepsMode`, `includeOptionalDeps` or `transitiveDepsMode` throws an error, as these options are not used with Metro. `@callstack/licenses` exposes the new `scanPackageRoots` and `findPackageRoot` functions.
