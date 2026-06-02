# Bare RN Decision Tree

Use this skill when:

- prompt asks to list/display/render OSS libraries in the app or code
- prompt asks for bare React Native integration of `react-native-legal` or React Native Legal
- prompt asks for `react-native legal-generate`
- prompt requests native artifact validation for generated licenses metadata
- repository context indicates React Native app work rather than Expo plugin or Node-only reporting flow

<!-- TODO: move to router -->

Routing note:

- Do not use `ios/` and `android/` folder presence as the primary bare signal, because Expo Prebuild can generate both folders.
- Treat those folders as supporting evidence only.
- If prompt intent and repo signals conflict (e.g., Expo + bare signals), ask one focused clarification question before implementation.

Do not use this skill as primary when:

- project is Expo-managed and asks for config plugin path
- prompt is Node-only reporting/compliance
