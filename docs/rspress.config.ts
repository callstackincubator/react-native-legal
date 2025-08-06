import * as path from 'node:path';

import { pluginCallstackTheme } from '@callstack/rspress-theme/plugin';
import { pluginTypeDoc } from '@rspress/plugin-typedoc';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'React Native Legal & License Kit',
  description: 'React Native Legal & License Kit Documentation',
  icon: '/img/rn-legal-logo.svg',
  logo: '/img/rn-legal-logo.svg',
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/callstackincubator/react-native-legal',
      },
    ],
    footer: {
      message: `Copyright © ${new Date().getFullYear()} Callstack Open Source`,
    },
  },
  base: '/react-native-legal/',
  plugins: [
    pluginCallstackTheme(),
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
});
