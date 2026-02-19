---
name: integrating-rn-legal-bare
description: Integrate react-native-legal into bare React Native projects, including install, `react-native legal-generate`, app wiring for built-in or custom OSS screens, and validation of generated Android/iOS artifacts. Use when repository is bare RN or user asks for CLI-based native legal metadata generation.
---

# Integrate React Native Legal (Bare RN)

Use this skill for bare React Native projects only.

## Execute this workflow

1. Install `react-native-legal` in the app workspace.
2. Run `react-native legal-generate` from app root.
3. Choose exactly one UI path:

- native built-in list via `ReactNativeLegal.launchLicenseListScreen(...)`
- custom list via `ReactNativeLegal.getLibrariesAsync()`

4. If UI path preference is not explicit, ask one focused question.
5. If the request is for a new screen in settings, default to the custom list path.
6. Do not mix native and custom list presentation in one implementation unless user explicitly asks.
7. If placement is not explicit, ask where to place it and propose new screen achievable from Settings (if exist) as default.
8. Prefer canonical import style.
9. Validate generated artifacts and wiring.

## Required checks

- Android: `android/config/` generated and activity/plugin wiring present.
- iOS: `Settings.bundle/Root.plist` exists and LicensePlist build phase is present.
- JS/TS: legal screen uses `react-native-legal` APIs.

## Read next

- Decision tree: `references/decision-tree.md`
- Commands: `references/commands.md`
- Validation: `references/validation-checklist.md`
- Limitations: `references/known-limitations.md`
- Implementation snippets: `references/implementation.md`

## Deterministic helper

Run:

```sh
node skills/integrating-rn-legal-bare/scripts/verify-bare-artifacts.mjs --root <app-root>
```
