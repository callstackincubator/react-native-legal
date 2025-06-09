import path from 'path';

import { generateAboutLibrariesNPMOutput, scanDependencies } from '@callstack/react-native-legal-shared';

import { addListActivity } from './addListActivity';
import { applyAndConfigureAboutLibrariesPlugin } from './applyAndConfigureAboutLibrariesPlugin';
import { declareAboutLibrariesPlugin } from './declareAboutLibrariesPlugin';

/**
 * Implementation of bare plugin's Android/Android TV setup
 *
 * It scans the NPM dependencies, generates AboutLibraries-compatible metadata for them,
 * installs & configures AboutLibraries Gradle plugin and adds Android Activity with a list of dependencies and their licenses
 */
export function androidCommand(androidProjectPath: string) {
  const licenses = scanDependencies(path.join(path.resolve(androidProjectPath, '..'), 'package.json'));

  generateAboutLibrariesNPMOutput(licenses, androidProjectPath);

  declareAboutLibrariesPlugin(androidProjectPath);
  applyAndConfigureAboutLibrariesPlugin(androidProjectPath);
  addListActivity(androidProjectPath);
}
