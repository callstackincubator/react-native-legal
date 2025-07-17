import { type Server } from 'node:http';
import path from 'node:path';
import { parse } from 'node:url';

import { type Command, InvalidArgumentError } from 'commander';
import express from 'express';
import helmet from 'helmet';
import next from 'next';
import open from 'open';

import { curryCommonScanOptions, curryReportOptions, validateCommonScanOptions } from '../utils/commandUtils';

const isDev = process.env.NODE_ENV !== 'production';

export default function visualizeCommandSetup(program: Command): Command {
  return curryCommonScanOptions(
    curryReportOptions(
      program.command('visualize').description('Launch a web license graph visualizer & analyzer app.'),
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
      ),
  ).action(async (options) => {
    validateCommonScanOptions(options);

    const expressApp = express();

    expressApp.use(
      helmet({
        contentSecurityPolicy: false,
      }),
    );

    const eventClients: Set<express.Response> = new Set();

    /** API routes - begin */

    expressApp.get('/events', (req, res) => {
      res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      res.flushHeaders();

      eventClients.add;

      req.on('close', () => {
        res.end();
      });
    });

    /** API routes - end */

    let server: Server;
    await new Promise<void>((resolve) => {
      server = expressApp.listen(options.port as number, options.host as string, async () => {
        console.log(`Server running at http://${options.host}:${options.port}`);

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

    process.on('SIGINT', () => {
      threadBlocker.resolve();

      eventClients.forEach((client) => client.end());
      process.exit(0);
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

    console.log('Press "q" or ctrl+c to stop the server');

    await threadBlocker.promise;

    console.log('Stopping the server...');

    eventClients.forEach((client) => client.end());
    server!.close();
    process.exit(0);
  });
}
