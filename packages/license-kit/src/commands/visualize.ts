import { watch } from 'node:fs';
import { type Server } from 'node:http';
import path from 'node:path';
import { parse } from 'node:url';

import { type Command, InvalidArgumentError } from 'commander';
import express from 'express';
import helmet from 'helmet';
import next from 'next';
import open from 'open';
import { Signale } from 'signale';

import { type LicensesMappingResult, generateLicensesMapping } from '../logic/generateLicensesMapping';
import { curryCommonScanOptions, validateCommonScanOptions } from '../utils/commandUtils';
import { getLockfilePath, getPackageLockChecksum } from '../utils/projectUtils';

const isDev = process.env.NODE_ENV !== 'production';

const visualizerSignale = new Signale({ scope: 'visualize' });
const sseSignale = new Signale({ scope: 'SSE' });
const apiSignale = new Signale({ scope: 'API' });
const reportSignale = new Signale({ scope: 'report' });

export default function visualizeCommandSetup(program: Command): Command {
  return curryCommonScanOptions(
    program
      .command('visualize')
      .description(
        'Launches a local server providing a web license graph visualizer & analyzer app: calculate permissiveness score (weighted average of points preset for given types), shows an interactive graph of licenses with possibility to select a subgraph, provides browser built-in AI-turbocharged summary of the dependency graph.',
      )
      .option(
        '--port [port]',
        'Port on which to launch the app',
        (value) => {
          const parsedValue = parseInt(value, 10);

          if (isNaN(parsedValue)) {
            throw new InvalidArgumentError('Not a number.');
          }

          return parsedValue;
        },
        8094,
      )
      .option('--h, --host [host]', 'Host on which to launch the app', 'localhost')
      .option(
        '--a, --auto-open [open]',
        'Host on which to launch the app',
        (value) => value === 'true' || value === '1',
        true,
      )
      .option('--root [path]', 'Path to the root of your project', '.'),
  ).action(async (options) => {
    validateCommonScanOptions(options);

    const expressApp = express();

    expressApp.use(
      helmet({
        contentSecurityPolicy: false,
      }),
    );

    const eventClients: Set<express.Response> = new Set();

    /** Logic - begin */

    let lastScanPackageJsonChecksum: string | null = null;
    let lastScanResult: LicensesMappingResult | null = null;

    function updateLastScanResultIfNeeded() {
      let result: LicensesMappingResult;
      const currentPackageJsonChecksum = getPackageLockChecksum(options);

      if (lastScanResult && lastScanPackageJsonChecksum === currentPackageJsonChecksum) {
        result = lastScanResult;

        return false;
      } else {
        if (lastScanResult) {
          reportSignale.log(
            `Project's root ${path.basename(
              getLockfilePath(options),
            )} changed (new checksum: ${currentPackageJsonChecksum}), re-generating report...`,
          );
        } else {
          reportSignale.log('Generating report for the first time, please stand by...');
        }

        result = generateLicensesMapping(options);

        reportSignale.log('Report generated');

        lastScanResult = result;
        lastScanPackageJsonChecksum = currentPackageJsonChecksum;

        return true;
      }
    }

    /** Logic - end */

    /** API routes - begin */

    expressApp.get('/api/report', (req, res) => {
      if (!lastScanResult) {
        updateLastScanResultIfNeeded();
      }

      const { licenses, projectName } = lastScanResult!;

      res.json({
        report: licenses,
        projectName,
      });
    });

    expressApp.get('/api/events', (req, res) => {
      res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      res.flushHeaders();

      eventClients.add(res);

      req.on('close', () => {
        res.end();
      });
    });

    /** API routes - end */

    /** Lockfile watcher - begin */

    const lockfilePath = getLockfilePath(options);

    visualizerSignale.log(`Watching '${lockfilePath}' file for changes`);

    const packageJsonWatcher = watch(lockfilePath, (event) => {
      if (event === 'change') {
        const didChange = updateLastScanResultIfNeeded();

        if (didChange) {
          sseSignale.log('Sending report updates to clients over SSE');

          eventClients.forEach((client) => {
            client.write(
              `event: message\ndata: ${JSON.stringify({
                type: 'UPDATE',
                report: lastScanResult!.licenses,
                projectName: lastScanResult!.projectName,
              })}\n\n`,
            );
          });
        }
      }
    });

    /** Lockfile watcher - end */

    let server: Server;
    await new Promise<void>((resolve) => {
      server = expressApp.listen(options.port as number, options.host as string, async () => {
        apiSignale.log('Preparing GUI server...');

        // Next app
        const visualizerNextAppDir = path.join(__dirname, '..', '..', ...(isDev ? ['visualizer'] : []));
        const visualizerNextApp = next({
          dev: isDev,
          dir: visualizerNextAppDir,
          customServer: true,
          httpServer: server,
          hostname: options.host as string,
          port: options.port as number,
        });

        await visualizerNextApp.prepare();

        const visualizerReqHandler = visualizerNextApp.getRequestHandler();

        expressApp.use((req, res) => {
          visualizerReqHandler(req, res, parse(req.url!, true));
        });

        apiSignale.log(`Server running at http://${options.host}:${options.port}\n`);

        // open the browser automatically
        if (options.autoOpen) {
          await open(`http://${options.host}:${options.port}`);
        }

        resolve();
      });
    });

    const threadBlocker = (() => {
      let resolver!: () => void;
      const promise = new Promise<void>((resolve) => {
        resolver = resolve;
      });

      return {
        resolve: resolver,
        promise,
      };
    })();

    function shutdown() {
      eventClients.forEach((client) => client.end());
      server?.close();
      packageJsonWatcher.close();
      process.exit(0);
    }

    process.on('SIGINT', () => {
      threadBlocker.resolve();

      shutdown();
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (inputBuff) => {
      const input = inputBuff.toString().trim().toLowerCase();

      if (input === 'q' || input === '\u0003') {
        threadBlocker.resolve();
      }
    });

    visualizerSignale.log('Press "q" or ctrl+c to stop the server');

    await threadBlocker.promise;

    visualizerSignale.log('Stopping the server...');

    shutdown();
  });
}
