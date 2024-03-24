/**
 * Making sure the first thing the code does is changing the captureRejections
 * option to true to account for all new instances of EventEmitter. If every
 * module only exports functions and has no global variables, then, in theory
 * you could do it in a later stage. With that said we don't want to trust the
 * initialization order, so we make sure it is the first thing that is being done
 * When the server runs
 */
import { EventEmitter } from 'node:events';

// See: https://nodejs.org/api/events.html#capture-rejections-of-promises
EventEmitter.captureRejections = true;

/**********************************************************************************/

import {
  compress,
  cors,
  createServer,
  express,
  inspect,
  type Application,
  type Server
} from './types/index.js';

import { getEnv, StatusCodes } from './utils/index.js';

/**********************************************************************************/

async function startServer() {
  const { mode, server: serverEnv } = getEnv();

  const app = express();
  const server = createServer(app);

  attachServerConfigurations(server);
  await attachMiddleware(app, serverEnv.allowedOrigins);

  attachRoutes(app, serverEnv.healthCheckRoute);

  server.listen(serverEnv.port, () => {
    console.info(
      `Server is running in '${mode}' mode on:` +
        ` ${serverEnv.url}:${serverEnv.port}/${serverEnv.apiRoute}`
    );
  });

  process
    .on('warning', console.warn)
    .once('SIGINT', () => {
      server.close();
    })
    .once('SIGQUIT', () => {
      server.close();
    })
    .once('SIGTERM', () => {
      server.close();
    })
    // Once since if any of these errors occur, the server will be shutdown, see:
    // https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#error-exception-handling
    // For reasoning
    .once('unhandledRejection', globalErrorHandler(server, 'rejection'))
    .once('uncaughtException', globalErrorHandler(server, 'exception'));
}

async function attachMiddleware(app: Application, allowedOrigins: Set<string>) {
  // No need to give the clients the information on which framework we are using
  app.disable('etag').disable('x-powered-by');

  app.use(
    // If you build a server which should not receive any browser requests,
    // feel free to remove cors from here and as a dependency
    cors({
      // '*' and ['*'] are not the same, hence need to explicitly check for it
      origin:
        allowedOrigins.size === 1
          ? Array.from(allowedOrigins)[0]
          : Array.from(allowedOrigins),
      // Add or remove if you need any additional methods
      methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    }),
    // This is the result of a bug with helmet typescript support, if helmet
    // version is updated, you may check if this is still needed (the dynamic
    // import)
    (await import('helmet')).default({
      contentSecurityPolicy: true /* require-corp */,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      originAgentCluster: true,
      referrerPolicy: { policy: 'no-referrer' },
      strictTransportSecurity: {
        maxAge: 15_552_000, // seconds
        includeSubDomains: true
      },
      xContentTypeOptions: true,
      xDnsPrefetchControl: false,
      xDownloadOptions: true,
      xFrameOptions: { action: 'sameorigin' },
      xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
      xPoweredBy: false,
      xXssProtection: true
    }),
    compress()
  );
}

function attachRoutes(app: Application, healthCheckRoute: string) {
  app.get(`/${healthCheckRoute}`, (_, res) => {
    let notReadyMsg = '';
    // Database/Any other service readiness check should have the same format
    // as below
    try {
      // Put the check here
    } catch (err) {
      notReadyMsg += '\nDatabase is unavailable';
    }
    if (notReadyMsg) {
      notReadyMsg = `Application is not available: ${notReadyMsg}`;
    }
    if (notReadyMsg) {
      return res.status(StatusCodes.GATEWAY_TIMEOUT).send(notReadyMsg);
    }

    return res.status(StatusCodes.NO_CONTENT).end();
  });
}

function attachServerConfigurations(server: Server) {
  // Every configuration referring to sockets here, talks about network/tcp
  // socket NOT websockets. Network socket is the underlying layer for http
  // request (in this case). In short, the socket options refer to a "standard"
  // connection from a client
  server.maxHeadersCount = 50;
  server.headersTimeout = 20_000; // millis
  server.requestTimeout = 20_000; // millis
  // Connection close will terminate the tcp socket once the payload was
  // transferred and acknowledged. This setting is for the rare cases where,
  // for some reason, the tcp socket is left alive
  server.timeout = 600_000; // millis
  // See: https://github.com/nodejs/node/issues/40071
  // Leaving this without any limit will cause the server to reuse the
  // connection indefinitely (in theory). As a result, load balancing will
  // have very little effects if more instances of the server are brought up
  // by the deployment orchestration tool.
  // As for a good number, it depends on the application traffic.
  // The current value is random power of 2 which we liked
  server.maxRequestsPerSocket = 100;
  server.keepAliveTimeout = 10_000; // millis
}

function globalErrorHandler(server: Server, reason: 'exception' | 'rejection') {
  return (err: unknown) => {
    console.error(`Unhandled ${reason}. This may help:\n ${inspect(err)}`);

    server.close();

    // See: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#error-exception-handling
    process.exit(1);
  };
}

/**********************************************************************************/

await startServer();
