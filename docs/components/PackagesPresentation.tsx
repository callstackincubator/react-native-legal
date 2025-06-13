// @ts-ignore-next-line
// eslint-disable-next-line import/no-unresolved
import { LinkCard } from '@theme';

export function PackagesPresentation() {
  return (
    <div className="flex-intro-cards">
      <LinkCard
        href="/react-native-legal/docs/react-native"
        title="React Native"
        description="I'm using React Native, either bare (RN CLI) or with Expo and want to display a licenses screen in my app."
      />

      <LinkCard
        href="/react-native-legal/docs/standalone-cli"
        title="Node.js CLI"
        description="I'm building a Node.js app or a non-React-Native project and want to generate license reports for my dependencies."
      />

      <LinkCard
        href="/react-native-legal/docs/programmatic-usage"
        title="Programmatic API"
        description="I want to use the core functionalities but adjust the presentation of the license report, or process the data in a different way."
      />
    </div>
  );
}
