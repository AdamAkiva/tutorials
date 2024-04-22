import {
  compress,
  cors,
  createServer,
  express,
  isDevelopmentMode,
  isProductionMode,
  isTestMode,
  resolve,
  type AddressInfo,
  type CorsOptions,
  type Logger,
  type Mode,
  type NextFunction,
  type Request,
  type Response
} from '../utils/index.js';

import * as Middlewares from './middleware.js';

/**********************************************************************************/

export default class HttpServer {
  // Allowed since v20.11.0: https://github.com/nodejs/node/pull/48740
  private static readonly OPENAPI_FILE = resolve(
    import.meta.dirname,
    '../api-docs/openapi.html'
  );

  private readonly _mode;

  private readonly _allowedMethods;
  private readonly _routes;

  private readonly _logger;

  private readonly _corsOptions: CorsOptions;

  private readonly _app;
  private readonly _server;

  public constructor(params: {
    mode: Mode;
    allowedMethods: Set<string>;
    allowedOrigins: Set<string>;
    routes: { http: string; health: string };
    logger: Logger['_handler'];
  }) {
    const { mode, allowedMethods, allowedOrigins, routes, logger } = params;

    this._mode = mode;
    this._allowedMethods = allowedMethods;
    this._routes = routes;
    this._logger = logger;
    this._corsOptions = {
      methods: Array.from(this._allowedMethods),
      origin:
        allowedOrigins.size === 1
          ? Array.from(allowedOrigins)[0]
          : Array.from(allowedOrigins),
      maxAge: 60 * 60 * 24, // 1 day in seconds
      optionsSuccessStatus: 200 // last option here: https://github.com/expressjs/cors?tab=readme-ov-file#configuration-options
    };

    // Disable 'x-powered-by' should be pretty clear. Reason to disable etag
    // can be understood by this comprehensive answer: https://stackoverflow.com/a/67929691
    this._app = express().disable('etag').disable('x-powered-by');
    this._server = createServer(this._app);

    this._attachConfigurations();
    this._attachEventHandlers(this._logger);
  }

  public async listen(port?: number | string) {
    if (port) {
      port = typeof port === 'string' ? Number(port) : port;
    }

    return await new Promise<number>((resolve) => {
      this._server.once('listening', () => {
        if (!isTestMode(this._mode)) {
          // Can be asserted since this is not a unix socket and we are inside
          // the listen event
          const { address, port } = this._server.address() as AddressInfo;
          const route = this._routes.http;

          this._logger.info(
            `Server is running in '${this._mode}' mode on: ` +
              `'${address.endsWith(':') ? address : address.concat(':')}${port}${route}'`
          );
        }

        resolve((this._server.address() as AddressInfo).port);
      });

      this._server.listen(port);
    });
  }

  public close() {
    this._server.close();
  }

  public async attachConfigurationMiddlewares() {
    this._app.use(
      Middlewares.checkMethod(this._allowedMethods),
      // Feel free to remove cors if the application has no frontend
      cors(this._corsOptions),
      compress()
    );
    if (isProductionMode(this._mode)) {
      this._app.use(
        (await import('helmet')).default({
          contentSecurityPolicy: true /* require-corp */,
          crossOriginEmbedderPolicy: { policy: 'require-corp' },
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
          xFrameOptions: { action: 'deny' },
          xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
          xXssProtection: true
        })
      );
    }
  }

  public attachRoutesMiddlewares(params: {
    allowedHosts: Set<string>;
    readyCheck: () => Promise<string> | string;
    logMiddleware: (req: Request, res: Response, next: NextFunction) => void;
  }) {
    const { allowedHosts, readyCheck, logMiddleware } = params;
    const { http: httpRoute, health: healthRoute } = this._routes;

    if (isDevelopmentMode(this._mode)) {
      this._attachAPIDocs(httpRoute);
    }

    this._app
      .get(healthRoute, Middlewares.healthCheck(allowedHosts, readyCheck))
      // The middlewares are executed in order (as set by express) and there's
      // no point to log every health check or every call to the api-docs
      // (development only), so the log middleware comes after the health
      // check route
      .use(logMiddleware)
      .use(
        httpRoute,
        Middlewares.attachContext(this._logger)
        // Add relevant router(s) here
      )
      // Non-existent route & error handler
      .use(Middlewares.handleMissedRoutes, Middlewares.errorHandler);
  }

  /********************************************************************************/

  private _attachConfigurations() {
    // Every configuration referring to sockets here, talks about network/tcp
    // socket NOT websockets. Network socket is the underlying layer for http
    // request (in this case). In short, the socket options refer to a "standard"
    // connection from a client
    this._server.maxHeadersCount = 50;
    this._server.headersTimeout = 20_000; // millis
    this._server.requestTimeout = 20_000; // millis
    // Connection close will terminate the tcp socket once the payload was
    // transferred and acknowledged. This setting is for the rare cases where,
    // for some reason, the tcp socket is left alive
    this._server.timeout = 600_000; // millis
    // See: https://github.com/nodejs/node/issues/40071
    // Leaving this without any limit will cause the server to reuse the
    // connection indefinitely (in theory). As a result, load balancing will
    // have very little effects if more instances of the server are brought up
    // by the deployment orchestration tool.
    // As for a good number, it depends on the application traffic.
    // The current value is random power of 2 which we liked
    this._server.maxRequestsPerSocket = 100;
    this._server.keepAliveTimeout = 10_000; // millis
  }

  private _attachEventHandlers(logger: Logger['_handler']) {
    this._server.on('error', (err) => {
      logger.fatal(err, 'HTTP Server error');

      // If an event emitter error happened, we shutdown the application.
      // As a result we allow the deployment orchestration tool to attempt to
      // rerun the application in a clean state
      process.exit(1);
    });
  }

  private _attachAPIDocs(apiRoute: string) {
    this._app.use(`${apiRoute}/api-docs`, (_, res) => {
      res.sendFile(HttpServer.OPENAPI_FILE);
    });
  }
}
