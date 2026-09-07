# Bare RN Commands

From app workspace root:

```sh
yarn add react-native-legal
```

```sh
yarn react-native legal-generate
```

Flag semantics for bare plugin (`react-native legal-generate`):

- `--dm, --dev-deps-mode [mode]`
  - `root-only`: include only direct `devDependencies` from root `package.json`
  - `none`: do not include `devDependencies`
  - default: `none`
- `--od, --include-optional-deps [include]`
  - `true`/`false`: include `optionalDependencies` or not
  - default: `true`
- `--tm, --transitive-deps-mode [mode]`
  - `all`: include all transitive dependencies
  - `from-external-only`: include only transitive dependencies coming from non-`workspace:` direct dependencies
  - `from-workspace-only`: include only transitive dependencies coming from `workspace:` direct dependencies
  - `none`: do not include transitive dependencies
  - default: `all`

Optional full command with explicit flags:

```sh
yarn react-native legal-generate --dev-deps-mode=none --include-optional-deps --transitive-deps-mode=all
```

Default mismatch note:

- `license-kit` CLI uses `--dev-deps-mode=root-only` by default, but bare RN plugin defaults to `none`.

Quick artifact verification:

```sh
node skills/integrating-rn-legal-bare/scripts/verify-bare-artifacts.mjs --root .
```
