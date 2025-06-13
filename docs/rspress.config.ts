import * as path from 'node:path';

import { pluginCallstackTheme } from '@callstack/rspress-theme/plugin';
import { pluginTypeDoc } from '@rspress/plugin-typedoc';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'React Native Legal & License Kit',
  description: 'React Native Legal & License Kit Documentation',
  logoText: 'React Native Legal & License Kit',
  icon: '/img/notice.png',
  logo: '/img/notice.png',
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
    // @ts-ignore-next-line
    pluginTypeDoc({
      entryPoints: [path.join(__dirname, '..', 'packages', 'shared', 'src', 'index.ts')],
      outDir: 'api',
    }),
  ],
  globalStyles: path.join(__dirname, 'styles/globalStyles.css'),
});
