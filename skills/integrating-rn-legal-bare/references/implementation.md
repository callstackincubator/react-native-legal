# Bare RN Implementation Snippets

## Canonical import

Always import the API this way:

```tsx
import { ReactNativeLegal } from 'react-native-legal';
```

## Launch native screen

Use when user explicitly prefers native built-in presentation:

```tsx
const launchLicenseListScreen = useCallback(() => {
  ReactNativeLegal.launchLicenseListScreen(); // pass title string
}, []);
```

## Get libraries for custom screen

Use when user asks for a dedicated screen:

```tsx
import type { LibrariesResult } from 'react-native-legal';

const getLibraries = useCallback(async () => {
  const libraries: LibrariesResult = await ReactNativeLegal.getLibrariesAsync();

  // Consume libraries.data in your screen list state.
}, []);
```

## Rules

- Do not mix custom list and native list launch in one implementation unless user explicitly requests both.
- Do not use dynamic `require('react-native-legal')` fallback wrappers.
