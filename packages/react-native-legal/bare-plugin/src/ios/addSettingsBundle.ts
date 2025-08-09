import fs from 'fs';

import { addSettingsBundleUtil } from '../../../plugin-utils/build/ios';

import { addToAllPbxResourcesBuildPhases, getIOSPbxProj, getIOSProjectName } from './utils';

/**
 * Creates a Settings.bundle and links it to all application native targets
 */
export function addSettingsBundle(iosProjectPath: string) {
  addSettingsBundleUtil(iosProjectPath, ({ settingsBundleFilename }) => {
    const projectName = getIOSProjectName(iosProjectPath);
    const { pbxproj, pbxprojPath } = getIOSPbxProj(iosProjectPath);

    let group: string | undefined = pbxproj.findPBXGroupKey({ name: projectName });

    if (!group) {
      // https://github.com/callstackincubator/react-native-legal/issues/81
      // If the project name is wrapped in quotes inside pbxproj file, let's try to grab it
      group = pbxproj.findPBXGroupKey({ name: `"${projectName}"` });
    }

    if (!group) {
      throw new Error(`Could not find group named: ${projectName} in the pbxproj`);
    }

    pbxproj.removeFile(settingsBundleFilename, group);

    const settingsBundleFile = pbxproj.addFile(settingsBundleFilename, group);

    if (!settingsBundleFile) {
      throw new Error('Could not add Settings.bundle file reference to xcode project');
    }

    settingsBundleFile.uuid = pbxproj.generateUuid();

    pbxproj.addToPbxBuildFileSection(settingsBundleFile);
    addToAllPbxResourcesBuildPhases(pbxproj, settingsBundleFile);

    fs.writeFileSync(pbxprojPath, pbxproj.writeSync());
  });
}
