---
'react-native-legal': patch
---

Include `android/gradle.properties` in the published package, so the Android library resolves its AGP, Compose BOM and AboutLibraries versions when installed from npm instead of failing with `Could not find com.android.tools.build:gradle:null`
