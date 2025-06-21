import fs from 'fs';
import path from 'path';

import type { XcodeProject } from 'xcode';

/**
 * Creates a Settings.bundle from a template and invokes a callback responsible for linking new file to the iOS project
 */
export function addSettingsBundleUtil(
  iosProjectPath: string,
  addResourceFileToGroup: ({ settingsBundleFilename }: { settingsBundleFilename: string }) => void,
) {
  const settingsBundleFilename = 'Settings.bundle';
  const settingsBundleRootPlistFilename = 'Root.plist';
  const settingsBundlePath = path.join(iosProjectPath, settingsBundleFilename);
  const settingsBundleRootPlistPath = path.join(settingsBundlePath, settingsBundleRootPlistFilename);

  if (!fs.existsSync(settingsBundleRootPlistPath)) {
    // Create `Settings.bundle` directory
    if (!fs.existsSync(settingsBundlePath)) {
      fs.mkdirSync(settingsBundlePath, { recursive: true });
    }

    // Create `Settings.bundle/Root.plist`
    fs.writeFileSync(settingsBundleRootPlistPath, SETTINGS_BUNDLE_ROOT_PLIST_CONTENT);

    // Link `Settings.bundle` to the resources
    addResourceFileToGroup({ settingsBundleFilename });
    console.log('Settings.bundle/Root.plist - ADDED');
  } else {
    console.log('Settings.bundle/Root.plist already present - SKIP');
  }
}

/**
 * Creates a shell script build phase (if needed) and links it to native targets build phases
 */
export function registerLicensePlistBuildPhaseUtil(
  projectTargetId: string,
  pbxproj: XcodeProject, // Xcode Pbxproj
) {
  const nativeTargetSection = pbxproj.pbxNativeTargetSection();
  const nativeTarget = nativeTargetSection[projectTargetId];

  if (pbxproj.buildPhase(GENERATE_LICENSE_PLIST_BUILD_PHASE_COMMENT, projectTargetId)) {
    console.log(`LicensePlist buildPhase already added in "${nativeTarget.name}" - SKIP`);
    return pbxproj;
  }

  /**
   * The build phase will generate licenses metadata using `LicensePlist` library and store it inside `Settings.bundle`.
   *
   * This will return an object with the uuid of the newly created build phase and its associated comment.
   */
  const newBuildPhase = pbxproj.addBuildPhase(
    [],
    'PBXShellScriptBuildPhase',
    GENERATE_LICENSE_PLIST_BUILD_PHASE_COMMENT,
    projectTargetId,
    {
      shellPath: '/bin/sh',
      shellScript: '${PODS_ROOT}/LicensePlist/license-plist --add-version-numbers --output-path ./Settings.bundle',
    },
  );
  /**
   * In order to correctly link all metadata from `Settings.bundle` to the app
   * the newly created build phase has to be invoked before `Copy Bundle Resources` build phase.
   *
   * To make sure that happens, let's put newly created build phase as a first in the sequence.
   * It can be done by overriding `PBXNativeTarget["buildPhases"]` array.
   */
  const newBuildPhasesInNativeTarget = [
    { value: newBuildPhase.uuid, comment: GENERATE_LICENSE_PLIST_BUILD_PHASE_COMMENT },
  ].concat(nativeTarget.buildPhases.filter(({ value }: { value: string }) => value !== newBuildPhase.uuid));

  nativeTarget.buildPhases = newBuildPhasesInNativeTarget;

  console.log(`LicensePlist buildPhase in nativeTarget "${nativeTarget.name}" - ADDED`);

  return pbxproj;
}

const GENERATE_LICENSE_PLIST_BUILD_PHASE_COMMENT = 'Generate licenses with LicensePlist';
const SETTINGS_BUNDLE_ROOT_PLIST_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>StringsTable</key>
  <string>Root</string>
  <key>PreferenceSpecifiers</key>
  <array>
    <dict>
      <key>Type</key>
      <string>PSChildPaneSpecifier</string>
      <key>Title</key>
      <string>Licenses</string>
      <key>File</key>
      <string>com.mono0926.LicensePlist</string>
    </dict>
  </array>
</dict>
</plist>`;
