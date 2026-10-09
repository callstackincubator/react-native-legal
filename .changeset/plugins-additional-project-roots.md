---
'react-native-legal': minor
---

Add `additionalProjectRoots` option to the Expo config plugin and `--additional-project-roots` (`--apr`) flag to `legal-generate` to also list licenses of dependencies from folders the app does not depend on, e.g. monorepo workspaces or a separately bundled JS VM. It cannot be combined with `dependencySource: 'metro'`
