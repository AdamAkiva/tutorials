/**
 * DON'T change the import to the local one, this needs to happen before everything.
 * This makes sure the first thing the code does is changing the captureRejections
 * option to true to account for all new instances of EventEmitter. If every
 * module only exports functions and has no global variables, then, in theory
 * you could do it in a later stage. With that said we don't want to trust the
 * initialization order, so we make sure it is the first thing that is being done
 * When the server runs
 */
//
import { EventEmitter } from 'node:events';

// See: https://nodejs.org/api/events.html#capture-rejections-of-promises
EventEmitter.captureRejections = true;

/**********************************************************************************/

import { createHttpServer, createLogger } from './init.js';
import type { HttpServer } from './server/index.js';
import { generalDebug, getEnv, type Logger } from './utils/index.js';

/**********************************************************************************/

await startServer();

/**********************************************************************************/

async function startServer() {
  generalDebug('Application starting...');

  const { mode, server: serverEnv } = getEnv();

  const { handler: logger, middleware: logMiddleware } = createLogger();

  const server = await createHttpServer({
    mode: mode,
    allowedOrigins: serverEnv.allowedOrigins,
    routes: {
      http: `/${serverEnv.httpRoute}`,
      health: `/${serverEnv.healthCheck.route}`
    },
    allowedMethods: new Set([
      'HEAD',
      'GET',
      'POST',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ]),
    allowedHosts: serverEnv.healthCheck.allowedHosts,
    logger: { handler: logger, middleware: logMiddleware }
  });

  await server.listen(serverEnv.port);

  attachProcessHandlers(server, logger);

  generalDebug('Application is ready');
}

/**********************************************************************************/

function attachProcessHandlers(server: HttpServer, logger: Logger['_handler']) {
  process
    .on('warning', logger.warn)
    .once('SIGINT', () => {
      server.close();
    })
    .once('SIGQUIT', () => {
      server.close();
    })
    .once('SIGTERM', () => {
      server.close();
    })
    .once(
      'unhandledRejection',
      globalErrorHandler({
        server: server,
        reason: 'rejection',
        logger: logger
      })
    )
    .once(
      'uncaughtException',
      globalErrorHandler({
        server: server,
        reason: 'exception',
        logger: logger
      })
    );
}

function globalErrorHandler(params: {
  server: HttpServer;
  reason: 'exception' | 'rejection';
  logger: Logger['_handler'];
}) {
  const { server, reason, logger } = params;

  return (err: unknown) => {
    logger.fatal(err, `Unhandled ${reason}`);

    server.close();

    // See: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#error-exception-handling
    process.exit(1);
  };
}
