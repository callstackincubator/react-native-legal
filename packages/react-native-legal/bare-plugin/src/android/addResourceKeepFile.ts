import { addResourceKeepFileUtil } from '../../../plugin-utils/build/android';

/**
 * Adds a file that will keep the About Libraries json resource when resource shrinking is enabled
 */
export function addResourceKeepFile(androidProjectPath: string) {
  addResourceKeepFileUtil(androidProjectPath);
}
