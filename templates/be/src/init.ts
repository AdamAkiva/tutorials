import { HttpServer } from './server/index.js';
import { Logger, type Mode } from './utils/index.js';

/**********************************************************************************/

export function createLogger() {
  const logger = new Logger();

  return {
    handler: logger.getHandler(),
    middleware: logger.getLogMiddleware()
  };
}

export async function createHttpServer(params: {
  mode: Mode;
  allowedOrigins: Set<string>;
  routes: {
    http: string;
    health: string;
  };
  allowedMethods: Set<string>;
  allowedHosts: Set<string>;
  logger: { handler: Logger['_handler']; middleware: Logger['_logMiddleware'] };
}) {
  const {
    mode,
    allowedOrigins,
    routes,
    allowedMethods,
    allowedHosts,
    logger: { handler: loggerHandler, middleware: logMiddleware }
  } = params;

  const server = new HttpServer({
    mode: mode,
    allowedMethods: allowedMethods,
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
