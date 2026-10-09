import child_process from 'node:child_process';
import path from 'node:path';

const exampleDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(exampleDir, '..', '..');
const licenseKitBin = path.join(repoRoot, 'packages', 'license-kit', 'build', 'index.js');

async function runReportWithRootFromDirectory(cwd: string) {
  const command = `node "${licenseKitBin}" report --root "${exampleDir}"`;

  const output = await new Promise<string>((resolve, reject) => {
    child_process.exec(
      command,
      {
        cwd,
        maxBuffer: 1024 * 1024 * 100, // 100MB
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`license-kit report failed: ${stderr || error.message}`));

          return;
        }

        resolve(stdout);
      },
    );
  });

  return JSON.parse(output);
}

describe('license-kit report --root', () => {
  it('lists the same packages whatever the working directory is', async () => {
    const fromExampleDir = await runReportWithRootFromDirectory(exampleDir);
    const fromRepoRoot = await runReportWithRootFromDirectory(repoRoot);

    expect(Object.keys(fromRepoRoot).sort()).toEqual(Object.keys(fromExampleDir).sort());
  }, 30_000);

  it('lists every package with its resolved version', async () => {
    const json = await runReportWithRootFromDirectory(exampleDir);

    expect(Object.keys(json).filter((key) => key.endsWith('@undefined'))).toEqual([]);
  }, 30_000);
});
