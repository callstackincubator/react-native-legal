import child_process from 'node:child_process';
import path from 'node:path';

const exampleDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(exampleDir, '..', '..');
const licenseKitBin = path.join(repoRoot, 'packages', 'license-kit', 'build', 'index.js');

async function runReportCommandForJsonOutput(cwd: string) {
  const command = `node "${licenseKitBin}" report --root "${exampleDir}"`;

  const output = await new Promise<string>((resolve) => {
    child_process.exec(
      command,
      {
        cwd,
        maxBuffer: 1024 * 1024 * 100, // 100MB
      },
      (_, stdout) => {
        resolve(stdout);
      },
    );
  });

  return JSON.parse(output);
}

describe('license-kit report --root', () => {
  it('lists the same packages whatever the working directory is', async () => {
    const fromExampleDir = await runReportCommandForJsonOutput(exampleDir);
    const fromRepoRoot = await runReportCommandForJsonOutput(repoRoot);

    expect(Object.keys(fromRepoRoot).sort()).toEqual(Object.keys(fromExampleDir).sort());
  }, 30_000);

  it('lists every package with its resolved version', async () => {
    const json = await runReportCommandForJsonOutput(exampleDir);

    expect(Object.keys(json).filter((key) => key.endsWith('@undefined'))).toEqual([]);
  }, 30_000);
});
