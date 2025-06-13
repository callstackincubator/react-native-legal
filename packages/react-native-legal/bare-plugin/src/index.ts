import { androidCommand } from './android/androidCommand';
import { iosCommand } from './ios/iosCommand';

function generateLegal(androidProjectPath: string | undefined, iosProjectPath: string | undefined) {
  if (androidProjectPath) {
    androidCommand(androidProjectPath);
  }

  if (iosProjectPath) {
    iosCommand(iosProjectPath);
  }
}

export default generateLegal;
