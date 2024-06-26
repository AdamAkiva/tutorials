import {
  NodeTemplateError,
  StatusCodes,
  strcasecmp,
  type NextFunction,
  type Request,
  type RequestContext,
  type ResponseWithCtx,
  type ResponseWithoutCtx
} from '../utils/index.js';

/**********************************************************************************/

export function checkMethod(allowedMethods: Set<string>) {
  return (req: Request, res: ResponseWithoutCtx, next: NextFunction) => {
    const reqMethod = req.method.toUpperCase();

    if (!allowedMethods.has(reqMethod)) {
      // Reason for explicitly adding the header:
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Allow
      return res
        .set('Allow', Array.from(allowedMethods).join(', '))
        .status(StatusCodes.NOT_ALLOWED)
        .json(`${reqMethod} is not a supported method`);
    }

    return next();
  };
}

export function healthCheck(
  allowedHosts: Set<string>,
  isReadyCallback: () => Promise<string>
) {
  return async (req: Request, res: ResponseWithoutCtx) => {
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

export function attachContext(requestContext: RequestContext) {
  return (_: Request, res: ResponseWithCtx, next: NextFunction) => {
    res.locals.ctx = requestContext;

    return next();
  };
}

export function handleMissedRoutes(req: Request, res: ResponseWithoutCtx) {
  return res.status(StatusCodes.NOT_FOUND).json(`'${req.url}' does not exist`);
}

// eslint-disable-next-line @typescript-eslint/max-params
export function errorHandler(
  err: unknown,
  _: Request,
  res: ResponseWithCtx,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  // The order is based on two things, type fallback and the chances of each error
  // happening. For example, NodeTemplate error should be the most common error
  // reason, and it should be the first from that perspective
  if (err instanceof NodeTemplateError) {
    return res.status(err.getCode()).json(err.getMessage());
  }
  if (err instanceof Error && !strcasecmp(err.name, 'PayloadTooLargeError')) {
    return res
      .status(StatusCodes.CONTENT_TOO_LARGE)
      .json('Request is too large');
  }

  return handleUnexpectedError(err, res);
}

/**********************************************************************************/

function handleUnexpectedError(err: unknown, res: ResponseWithCtx) {
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
