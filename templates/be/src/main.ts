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

// The default stack trace limit is 10 calls. Increasing it to a number which
// we'll never have to think about it again
Error.stackTraceLimit = 256;

/**********************************************************************************/

import { HttpServer } from './server/index.js';
import { Logger, generalDebug, getEnv, type Mode } from './utils/index.js';

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
    logger: { handler: logger, middleware: logMiddleware },
    allowedHosts: serverEnv.healthCheck.allowedHosts
  });

  attachProcessHandlers(server, logger);

  await server.listen(serverEnv.port, () => {
    logger.info(
      `Server is running in '${mode}' mode on:` +
        ` ${serverEnv.baseUrl}:${serverEnv.port}/${serverEnv.httpRoute}`
    );

    generalDebug('Application is ready');
  });
}

/**********************************************************************************/

function createLogger() {
  const logger = new Logger();

  return {
    handler: logger.getHandler(),
    middleware: logger.getLogMiddleware()
  };
}

async function createHttpServer(params: {
  mode: Mode;
  allowedOrigins: Set<string>;
  routes: { http: string; health: string };
  logger: { handler: Logger['_handler']; middleware: Logger['_logMiddleware'] };
  allowedHosts: Set<string>;
}) {
  const {
    mode,
    allowedOrigins,
    routes,
    allowedHosts,
    logger: { handler: loggerHandler, middleware: logMiddleware }
  } = params;

  const server = new HttpServer({
    mode: mode,
    allowedOrigins: allowedOrigins,
    routes: routes,
    logger: loggerHandler
  });

  // The order matters!
  // These calls setup express middleware, and the configuration middleware
  // must be used BEFORE the routes
  await server.attachConfigurationMiddlewares();
  server.attachRoutesMiddlewares({
    allowedHosts: allowedHosts,
    // The reason for it being a callback it the ability to unit test it
    readyCheck: async () => {
      let notReadyMsg = '';
      try {
        // Put the health check(s) here
        await Promise.resolve(true);
      } catch (err) {
        loggerHandler.error(err, 'Database error');
        notReadyMsg += '\nDatabase is unavailable';
      }

      return notReadyMsg;
    },
    logMiddleware: logMiddleware
  });

  return server;
}

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
