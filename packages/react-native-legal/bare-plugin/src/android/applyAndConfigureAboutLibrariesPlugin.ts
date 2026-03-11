import fs from 'fs';
import path from 'path';

import { applyAndConfigureAboutLibrariesPluginUtil } from '../../../plugin-utils/build/android';
import type { AboutLibrariesOptions } from '../../../plugin-utils/build/types';

import { modifyFileContent } from './utils';

/**
 * Modifies application's build.gradle with AboutLibraries plugin
 *
 * NOTE: As of now, it doesn't support build.gradle.kts (Gradle Kotlin Script)
 */
export function applyAndConfigureAboutLibrariesPlugin(androidProjectPath: string, options?: AboutLibrariesOptions) {
  if (fs.existsSync(path.join(androidProjectPath, 'app', 'build.gradle.kts'))) {
    console.warn('Gradle Kotlin scripts are not supported yet');
  } else if (fs.existsSync(path.join(androidProjectPath, 'app', 'build.gradle'))) {
    modifyFileContent(path.join(androidProjectPath, 'app', 'build.gradle'), (content) =>
      applyAndConfigureAboutLibrariesPluginUtil(content, options),
    );
  } else {
    console.warn('Cannot find app/build.gradle file');
  }
}
