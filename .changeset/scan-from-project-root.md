---
'@callstack/licenses': patch
'license-kit': patch
---

Resolve dependencies relative to the scanned `package.json` instead of `process.cwd()`, walking up `node_modules` like Node.js does. Scan results no longer depend on the working directory (`license-kit --root` now works from any directory), packages that hide `package.json` behind `exports` are found instead of being skipped or reported without a version (e.g. `lru-cache@undefined`), and packages that are not installed for the scanned project are no longer looked up next to `@callstack/licenses` itself. License lists may therefore gain entries that were missing before.
