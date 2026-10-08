---
'@callstack/licenses': patch
'license-kit': patch
---

Resolve dependencies relative to the scanned `package.json` instead of `process.cwd()`, walking up `node_modules` like Node.js does. Scan results no longer depend on the working directory (`license-kit --root` now works from any directory), packages that hide `package.json` behind `exports` are no longer skipped, and packages that only `@callstack/licenses` itself could resolve are no longer reported (e.g. `lru-cache@undefined`). License lists may therefore gain entries that were missing before.
