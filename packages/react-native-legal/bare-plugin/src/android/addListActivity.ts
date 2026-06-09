import path from 'path';

import { addListActivityUtil } from '../../../plugin-utils/build/android';

import { modifyXMLFileContent } from './utils';

/**
 * Adds an Android Activity with list of dependencies and their licenses to project's AndroidManifest.xml
 */
export async function addListActivity(androidProjectPath: string) {
  const androidManifestPath = path.join(androidProjectPath, 'app', 'src', 'main', 'AndroidManifest.xml');

  await modifyXMLFileContent(androidManifestPath, (manifestObj) => {
    if (manifestObj.manifest.application?.[0]?.activity) {
      manifestObj.manifest.application[0].activity = addListActivityUtil(
        manifestObj.manifest.application?.[0].activity,
      );
    }

    return manifestObj;
  });
}
