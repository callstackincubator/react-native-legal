import { Button, HomeFeature, HomeFooter, HomeHero } from '@theme';
import { usePageData } from 'rspress/runtime';

export function CustomHomePage() {
  const {
    page: { routePath },
  } = usePageData();

  return (
    <>
      <HomeHero
        frontmatter={{
          hero: {
            name:
              `<span class="hero-name">React Native Legal</span>` +
              '<br/>' +
              `<span class="hero-name">License Kit</span>`,
            text: '',
            tagline:
              `<span class="hero-tagline" style="line-height: 1.4;">` +
              'Automagically generate license acknowledgements' +
              '\n' +
              'for your <ins>React Native app</ins> & <ins>any Node.js</ins> project' +
              `</span>`,
            actions: [
              { theme: 'brand', text: 'React Native', link: '/docs/react-native' },
              { theme: 'brand', text: 'CLI', link: '/docs/standalone-cli' },
              { theme: 'brand', text: 'API', link: '/docs/programmatic-usage' },
              { theme: 'alt', text: 'GitHub', link: 'https://github.com/callstackincubator/react-native-legal' },
            ],
          },
        }}
        routePath={routePath}
      />

      <HomeFeature
        frontmatter={{
          features: [
            {
              title: 'Native Integration',
              details:
                'Uses native platform tools (LicensePlist for iOS and AboutLibraries for Android) to generate and display licenses.',
              icon: '📱',
              link: '/docs/react-native',
            },
            {
              title: 'Expo & Bare Workflow Support',
              details:
                'Works with both Expo managed workflow via Config Plugin and React Native CLI via custom command.',
              icon: '🔌',
              link: '/docs/react-native#setup',
            },
            {
              title: 'NodeJS / Non-RN Projects Support',
              details:
                'Works with any Node.js project, not just React Native apps. Use it to generate license reports for any Node.js application.',
              icon: '💻',
              link: '/docs/standalone-cli',
            },
            {
              title: 'Versatile output formats (CLI & Programmatic)',
              details:
                'Generate license reports in a format of choice (JSON, Markdown, raw text, AboutLibraries-compatible JSON metadata).',
              icon: '📝',
              link: '/docs/standalone-cli#command-line-options',
            },
            {
              title: 'Programmatic API',
              details:
                'Core functionalities are exposed as an importable package you can use programmatically and adjust the presentation / processing of the report contents.',
              icon: '🛠️',
              link: '/docs/programmatic-usage',
            },
            {
              title: 'Automatic Scanning',
              details:
                'Automatically scans your dependencies and generates license information for both iOS and Android platforms.',
              icon: '🔎',
              link: '/docs/react-native',
            },
          ],
        }}
        routePath={routePath}
      />

      <div className="docs-introduction-cta">
        <span
          onClick={() => {
            window.location.pathname = routePath + (routePath.endsWith('/') ? '' : '/') + 'docs/introduction';
          }}
        >
          {/* @ts-ignore-next-line -- invalid typings */}
          <Button text="Not sure, which to choose?" theme="alt" type="button" size="medium" />
        </span>
      </div>

      <div className="home-footer-wrapper">
        <HomeFooter />
      </div>
    </>
  );
}
