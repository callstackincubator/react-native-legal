---
'react-native-legal': patch
---

Fixes an issue where licenses with unusual indentation caused YAML errors, breaking the LicencePlist script during the build. This ensures proper processing and prevents build failures.
