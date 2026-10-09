# license-kit

## 1.0.0

### Major Changes

- [#209](https://github.com/callstackincubator/react-native-legal/pull/209) [`dd565f1`](https://github.com/callstackincubator/react-native-legal/commit/dd565f196512cd63f22968631633c7920eb10ec0) Thanks [@wjaszczuk](https://github.com/wjaszczuk)! - Parse licenses as SPDX License Expressions. Classification follows the expression (`AND` takes the most restrictive operand, `OR` follows the new `--or-policy` option, `WITH` and `+` take the base license's category), unrecognised values are Unknown instead of permissive, and every license file of a package is collected. **Breaking:** `type`, `content` and `file` are removed from scanned entries and `report --format json`; use `rawLicense`, `license`, `licenseIds` and `licenseFiles`. `MIT OR GPL-3.0` style packages now fail `copyleft` by default; `--or-policy least-restrictive` restores the previous result. See the migration guide. `copyleft` also lists licenses that could hide copyleft because part of their expression is Unknown (`MIT AND LicenseRef-Custom`) in a warning, and the new opt-in `--error-on-unidentified` flag exits with code `3` for them; the other exit codes are unchanged.

### Patch Changes

- Updated dependencies [[`8f2d9c7`](https://github.com/callstackincubator/react-native-legal/commit/8f2d9c7a274b8a3339cd43296d8169f445e5d656), [`dd565f1`](https://github.com/callstackincubator/react-native-legal/commit/dd565f196512cd63f22968631633c7920eb10ec0)]:
  - @callstack/licenses@1.0.0

## 0.3.5

### Patch Changes

- [#173](https://github.com/callstackincubator/react-native-legal/pull/173) [`0017b28`](https://github.com/callstackincubator/react-native-legal/commit/0017b28707c823add803c66a7905bf52dcb56ce2) Thanks [@mateusz1913](https://github.com/mateusz1913)! - Update dependencies (glob, next, commander)

- Updated dependencies [[`0017b28`](https://github.com/callstackincubator/react-native-legal/commit/0017b28707c823add803c66a7905bf52dcb56ce2)]:
  - @callstack/licenses@0.3.3

## 0.3.4

### Patch Changes

- [#144](https://github.com/callstackincubator/react-native-legal/pull/144) [`b691b7f`](https://github.com/callstackincubator/react-native-legal/commit/b691b7f850269ab147d8496a65dff06c71b8cc18) Thanks [@Berdsen](https://github.com/Berdsen)! - Updated dependencies because of known vulnerabilities

## 0.3.3

### Patch Changes

- [#140](https://github.com/callstackincubator/react-native-legal/pull/140) [`9ff83ca`](https://github.com/callstackincubator/react-native-legal/commit/9ff83cafecf760c64a8eb6036b4dffcb09ce20c2) Thanks [@Berdsen](https://github.com/Berdsen)! - Updated dependencies because of known vulnerabilities

## 0.3.2

### Patch Changes

- [#135](https://github.com/callstackincubator/react-native-legal/pull/135) [`186d9e3`](https://github.com/callstackincubator/react-native-legal/commit/186d9e39353327d2b08a2d6602a5bc7305b4b067) Thanks [@mateusz1913](https://github.com/mateusz1913)! - Update `@callstack/licenses` dependency from ^0.3.0 to ^0.3.1 to support https://github.com/callstackincubator/react-native-legal/commit/b912567f75f4ddc5123494eee32251219820d347

## 0.3.1

### Patch Changes

- [#90](https://github.com/callstackincubator/react-native-legal/pull/90) [`4fa38f6`](https://github.com/callstackincubator/react-native-legal/commit/4fa38f6c77fac994a03d4dabb4e252ec23166819) Thanks [@artus9033](https://github.com/artus9033)! - Resolve problem with missing next config & wrong path to prebuild visualizer web app, unify next version in license-kit and visualizer packages.

## 0.3.0

### Minor Changes

- [#88](https://github.com/callstackincubator/react-native-legal/pull/88) [`e09ba86`](https://github.com/callstackincubator/react-native-legal/commit/e09ba86fbbba38c33d48534ac3619538c212c92e) Thanks [@artus9033](https://github.com/artus9033)! - Added license-kit visualize & analyze commands, graph browsing and statistics in a web UI

### Patch Changes

- Updated dependencies [[`feae9be`](https://github.com/callstackincubator/react-native-legal/commit/feae9be21245251cec2a0d11d146faaa70cb8561)]:
  - @callstack/licenses@0.3.0

## 0.2.1

### Patch Changes

- [#66](https://github.com/callstackincubator/react-native-legal/pull/66) [`9534b4c`](https://github.com/callstackincubator/react-native-legal/commit/9534b4c053cf62d90b2772b5ecf30833bd20ae24) Thanks [@artus9033](https://github.com/artus9033)! - Migrated to new API package - @callstack/licenses

- Updated dependencies [[`9534b4c`](https://github.com/callstackincubator/react-native-legal/commit/9534b4c053cf62d90b2772b5ecf30833bd20ae24)]:
  - @callstack/licenses@0.2.1

## 0.2.0

### Minor Changes

- [#44](https://github.com/callstackincubator/react-native-legal/pull/44) [`4ebed78`](https://github.com/callstackincubator/react-native-legal/commit/4ebed78ed8cf95625df6c3211598cfe5db807b09) Thanks [@thymikee](https://github.com/thymikee)! - Separated copyleft and report commands, general code refactor

- [#47](https://github.com/callstackincubator/react-native-legal/pull/47) [`a836940`](https://github.com/callstackincubator/react-native-legal/commit/a83694000d55b2d5c8f3e1095330dfb4a410479b) Thanks [@artus9033](https://github.com/artus9033)! - Feature: flags for dependency scanning configuration for transitive & development dependencies

- [#54](https://github.com/callstackincubator/react-native-legal/pull/54) [`e89ba1f`](https://github.com/callstackincubator/react-native-legal/commit/e89ba1ff8fc1d8182a287cc257182a2d55374d95) Thanks [@artus9033](https://github.com/artus9033)! - Support for optionalDependencies

- [#56](https://github.com/callstackincubator/react-native-legal/pull/56) [`55f23b6`](https://github.com/callstackincubator/react-native-legal/commit/55f23b6d18858aacae76b9fe31e3f75fe2ef468c) Thanks [@artus9033](https://github.com/artus9033)! - Support for scanning of conflicting versions of installed libraries

### Patch Changes

- [#44](https://github.com/callstackincubator/react-native-legal/pull/44) [`4ebed78`](https://github.com/callstackincubator/react-native-legal/commit/4ebed78ed8cf95625df6c3211598cfe5db807b09) Thanks [@thymikee](https://github.com/thymikee)! - feat: setup new packages in monorepo

- Updated dependencies [[`e89ba1f`](https://github.com/callstackincubator/react-native-legal/commit/e89ba1ff8fc1d8182a287cc257182a2d55374d95), [`4ebed78`](https://github.com/callstackincubator/react-native-legal/commit/4ebed78ed8cf95625df6c3211598cfe5db807b09), [`55f23b6`](https://github.com/callstackincubator/react-native-legal/commit/55f23b6d18858aacae76b9fe31e3f75fe2ef468c), [`b644f22`](https://github.com/callstackincubator/react-native-legal/commit/b644f22f57657afa999c20059ce02b3e7ba71cfb), [`4ebed78`](https://github.com/callstackincubator/react-native-legal/commit/4ebed78ed8cf95625df6c3211598cfe5db807b09)]:
  - @callstack/react-native-legal-shared@0.2.0
