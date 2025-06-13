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

    pbxproj.removeFile(settingsBundleFilename, pbxproj.findPBXGroupKey({ name: projectName }));

    const settingsBundleFile = pbxproj.addFile(settingsBundleFilename, pbxproj.findPBXGroupKey({ name: projectName }));

    if (!settingsBundleFile) {
      throw new Error('Could not add Settings.bundle file reference to xcode project');
    }

    settingsBundleFile.uuid = pbxproj.generateUuid();

    pbxproj.addToPbxBuildFileSection(settingsBundleFile);
    addToAllPbxResourcesBuildPhases(pbxproj, settingsBundleFile);

    fs.writeFileSync(pbxprojPath, pbxproj.writeSync());
  });
}
