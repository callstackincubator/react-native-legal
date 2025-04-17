import type { LibrariesResult } from './NativeReactNativeLegal';

export const ReactNativeLegal = {
  getLibrariesAsync: () => {
    return Promise.resolve<LibrariesResult>({ data: [] });
  },
  launchLicenseListScreen: (_licenseHeaderText?: string) => {
    //
  },
};
