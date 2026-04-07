import * as path from 'node:path';

import { defineConfig } from '@rspress/core';
import { pluginTypeDoc } from '@rspress/plugin-typedoc';

import { withCallstackPreset } from '@callstack/rspress-preset';

export default withCallstackPreset(
  {
    context: __dirname,
    docs: {
      title: 'React Native Legal & License Kit',
      description: 'React Native Legal & License Kit Documentation',
      editUrl:
        'https://github.com/callstackincubator/react-native-legal/tree/main/docs',
      rootUrl: 'https://incubator.callstack.com/react-native-legal/',
      icon: 'icon.ico',
      logoLight: 'logo-light.png',
      logoDark: 'logo-dark.png',
      ogImage: 'og-image.png',
      // Optional: defaults to 'docs'
      rootDir: 'docs',
      // Optional: social links; keys follow Rspress theme icons
      socials: {
        github: 'https://github.com/callstackincubator/react-native-legal',
      },
    },
    // Optional: boolean or config for Vercel Analytics.
    vercelAnalytics: true,
  },
  defineConfig({
    root: path.join(__dirname, 'docs'),
    icon: '/img/rn-legal-logo.svg',
    logo: '/img/rn-legal-logo.svg',
    base: '/react-native-legal/',
    themeConfig: {
      footer: {
        message: `Copyright © ${new Date().getFullYear()} Callstack Open Source`,
      },
    },
    plugins: [
      pluginTypeDoc({
        entryPoints: [
          path.join(
            __dirname,
            '..',
            'packages',
            'licenses-api',
            'src',
            'index.ts',
          ),
        ],
        outDir: 'api',
      }),
    ],
    globalStyles: path.join(__dirname, 'theme/styles.css'),
  }),
);
