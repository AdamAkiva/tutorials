import {
  NodeTemplateError,
  StatusCodes,
  strcasecmp,
  type Logger,
  type NextFunction,
  type Request,
  type Response
} from '../utils/index.js';

/**********************************************************************************/

export function checkMethod(allowedMethods: Set<string>) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const reqMethod = req.method.toUpperCase();

    if (!allowedMethods.has(reqMethod)) {
      // Reason for explicitly adding the header:
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Allow
      return res
        .set('Allow', Array.from(allowedMethods).join(', '))
        .status(StatusCodes.NOT_ALLOWED)
        .json(`${reqMethod} is not a support method`);
    }

    return next();
  };
}

export function healthCheck(
  allowedHosts: Set<string>,
  isReadyCallback: () => Promise<string> | string
) {
  return async (req: Request, res: Response) => {
    if (strcasecmp(req.method, 'HEAD') && strcasecmp(req.method, 'GET')) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(`Health check must be a 'HEAD' or 'GET' request`);
    }

    const hostName = req.hostname.toLowerCase();
    if (!allowedHosts.has(hostName)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(`'${req.hostname}' is forbidden to make a healthcheck`);
    }

    let notReadyMsg = await isReadyCallback();
    if (notReadyMsg) {
      notReadyMsg = `Application is not available: ${notReadyMsg}`;
    }
    if (notReadyMsg) {
      return res.status(StatusCodes.GATEWAY_TIMEOUT).json(notReadyMsg);
    }

    return res.status(StatusCodes.NO_CONTENT).end();
  };
}

export function attachContext(logger: Logger['_handler']) {
  return function _attachContext(
    _: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.locals.ctx = {
      // Add additional context relevant fields
      logger: logger
    };

    return next();
  };
}

export function handleMissedRoutes(req: Request, res: Response) {
  return res.status(StatusCodes.NOT_FOUND).json(`'${req.url}' does not exist`);
}

// eslint-disable-next-line @typescript-eslint/max-params
export function errorHandler(
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }
  res.err = err; // Needed in order to display the correct stack trace in the logs

  // The order is based on two things, type fallback and the chances of each error
  // happening. For example, Dashboard error should be the most common error reason,
  // and it should be the first from that perspective
  if (err instanceof NodeTemplateError) {
    return res.status(err.getCode()).json(err.getMessage());
  }
  if (!strcasecmp(err.name, 'PayloadTooLargeError')) {
    return res
      .status(StatusCodes.CONTENT_TOO_LARGE)
      .json('Request is too large');
  }

  return handleUnexpectedError(err, res);
}

/**********************************************************************************/

function handleUnexpectedError(err: unknown, res: Response) {
  const logger = res.locals.ctx.logger;
  if (err instanceof Error) {
    logger.fatal(err, 'Unhandled exception');
  } else {
    logger.fatal(err, 'Caught a non-error object.\nThis should never happen');
  }

  return res
    .status(StatusCodes.SERVER_ERROR)
    .json('Unexpected error, please try again');
}
