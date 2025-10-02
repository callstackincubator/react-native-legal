import './ReactNativeLegalStyles.css';
import type { LibrariesResult } from './NativeReactNativeLegal';

function createElementWithClassName<K extends keyof HTMLElementTagNameMap>(tagName: K, className: string) {
  const element = document.createElement(tagName);

  element.className = className;

  return element;
}

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

    const main = createElementWithClassName('main', 'rnl--main');
    const closeBtn = createElementWithClassName('span', 'rnl--close-button');

    closeBtn.innerHTML = '&times;';

    const closeBtnContainer = createElementWithClassName('div', 'rnl--close-button-container');

    closeBtnContainer.ariaLabel = 'Close licenses dialog';
    closeBtnContainer.role = 'button';
    closeBtnContainer.appendChild(closeBtn);

    const headerContainer = createElementWithClassName('header', 'rnl--header-container');

    headerContainer.appendChild(closeBtnContainer);

    main.appendChild(headerContainer);

    if (licenseHeaderText) {
      const header = createElementWithClassName('h1', 'rnl--header');

      header.innerText = licenseHeaderText;

      headerContainer.appendChild(header);
    }

    payload.forEach((library: any) => {
      const summary = createElementWithClassName('summary', 'rnl--summary');

      summary.innerText = library.packageKey;

      const content = createElementWithClassName('p', 'rnl--summary-content');

      content.innerText = library.content;

      const details = createElementWithClassName('details', 'rnl--summary-details');

      details.appendChild(summary);
      details.appendChild(content);

      main.appendChild(details);
    });

    const dialog = createElementWithClassName('dialog', 'rnl--dialog');

    dialog.appendChild(main);

    document.querySelector('body')?.appendChild(dialog);

    closeBtnContainer.addEventListener(
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
