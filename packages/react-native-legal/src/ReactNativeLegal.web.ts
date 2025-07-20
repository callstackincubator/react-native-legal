import type { LibrariesResult } from './NativeReactNativeLegal';

export const ReactNativeLegal = {
  getLibrariesAsync: () => {
    const payload = require(`react-native-legal/.rnlegal/libraries.json`);

    return Promise.resolve<LibrariesResult>({
      data: payload.map((library: any) => ({
        id: library.packageKey,
        name: library.packageKey,
        licenses: [{ licenseContent: library.content }],
      })),
    });
  },
  launchLicenseListScreen: (licenseHeaderText?: string) => {
    const payload = require(`react-native-legal/.rnlegal/libraries.json`);

    const main = document.createElement('main');

    main.style.display = 'flex';
    main.style.alignSelf = 'stretch';
    main.style.flex = '1';
    main.style.flexDirection = 'column';
    main.style.overflow = 'scroll';
    main.style.width = '100%';

    const closeBtn = document.createElement('button');

    closeBtn.innerText = 'Close';

    const headerContainer = document.createElement('header');

    headerContainer.style.display = 'flex';
    headerContainer.style.flexDirection = 'row';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.justifyContent = 'space-between';
    headerContainer.appendChild(closeBtn);

    main.appendChild(headerContainer);

    if (licenseHeaderText) {
      const header = document.createElement('h1');

      header.innerText = licenseHeaderText;

      headerContainer.insertBefore(header, closeBtn);
    } else {
      headerContainer.style.flexDirection = 'row-reverse';
    }

    payload.forEach((library: any) => {
      const summary = document.createElement('summary');

      summary.style.fontSize = '20px';
      summary.style.margin = '10px 0px';
      summary.innerText = library.packageKey;

      const content = document.createElement('p');

      content.innerText = library.content;

      const details = document.createElement('details');

      details.appendChild(summary);
      details.appendChild(content);

      main.appendChild(details);
    });

    const dialog = document.createElement('dialog');

    dialog.id = 'react-native-legal-dialog';
    dialog.style.height = '90%';
    dialog.style.width = '90%';
    dialog.appendChild(main);

    document.querySelector('body')?.appendChild(dialog);

    closeBtn.addEventListener(
      'click',
      () => {
        document.querySelector('body')?.removeChild(dialog);
      },
      { once: true },
    );
    dialog.addEventListener(
      'close',
      () => {
        document.querySelector('body')?.removeChild(dialog);
      },
      { once: true },
    );
    dialog.showModal();
  },
};
