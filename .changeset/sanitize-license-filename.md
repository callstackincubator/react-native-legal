---
'@callstack/licenses': patch
---

Sanitize unsafe characters in `prepareAboutLibrariesLicenseField` so packages with legacy or compound SPDX expressions (e.g. `MIT/X11`, `(MIT OR Apache-2.0)`) no longer break the AboutLibraries metadata generation on Android. Previously the unsanitized `/` caused `writeAboutLibrariesNPMOutput` to attempt creating files like `android/config/licenses/MIT/X11_<hash>.json`, failing with `ENOENT` because `MIT/` was treated as a subdirectory.
