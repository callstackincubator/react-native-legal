import type { LibrariesResult } from './NativeReactNativeLegal';

export const ReactNativeLegal = {
  getLibraries: () => {
    return { data: [] } as LibrariesResult;
  },
  getLibrariesAsync: () => {
    return Promise.resolve<LibrariesResult>({ data: [] });
  },
  launchLicenseListScreen: (_licenseHeaderText?: string) => {
    //
  },
};
