import type { PackageManagerTabs } from 'rspress/theme';

/**
 * Workaround for the issue with `npx` not being used when the `npm` tab is selected in the `PackageManagerTabs` component.
 * This function generates the commands for different package managers, ensuring that `npx` is used
 * when the `npm` tab is selected, while other package managers use their respective commands.
 *
 * @param binCommand The command to execute, e.g. `react-native-legal`.
 * @returns The object for configuring the `PackageManagerTabs` component with commands for different package managers,
 * taking into account the need to use 'npx' when the 'npm' tab is selected.
 */
export function generateExecCommands(binCommand: string) {
  return {
    npm: `npx ${binCommand}`,
    yarn: `yarn ${binCommand}`,
    pnpm: `pnpm ${binCommand}`,
    bun: `bun ${binCommand}`,
  } satisfies React.ComponentProps<typeof PackageManagerTabs>['command'];
}
