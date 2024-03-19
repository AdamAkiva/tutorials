import { createServer, type Server } from 'node:http';
import { inspect } from 'node:util';

import compress from 'compression';
import cors from 'cors';
import express, {
  type Application,
  type Response as ExpressResponse,
  type NextFunction,
  type Request
} from 'express';

/**********************************************************************************/

export type UnknownObject = { [key: string]: unknown };
export type MaybeArray<T> = T | T[];

export type AddRequired<T, K extends keyof T> = Required<Pick<T, K>> & T;
export type AddOptional<T, K extends keyof T> = Omit<T, K> &
  Pick<Partial<T>, K>;
export type SwapKeysValue<T, K extends keyof T, V> = Omit<T, K> & {
  [P in K]: V;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResolvedValue<T> = T extends (...args: any) => any
  ? PromiseFulfilledResult<Awaited<ReturnType<T>>>
  : PromiseFulfilledResult<Awaited<T>>;

/**********************************************************************************/

export type Response = ExpressResponse<unknown, { ctx: RequestContext }>;
export type RequestContext = {
  // TODO This should hold the res.locals.ctx objects which are the values related
  // to the context of a request (such as DatabaseHandler, logger, etc...)
};

/**********************************************************************************/

export type Mode = 'development' | 'production' | 'test';
export type EnvironmentVariables = {
  mode: Mode;
  server: {
    port: string;
    url: string;
    apiRoute: string;
    healthCheckRoute: string;
    allowedOrigins: Set<string>;
  };
};

/**********************************************************************************/

export {
  compress,
  cors,
  createServer,
  express,
  inspect,
  type Application,
  type NextFunction,
  type Request,
  type Server
};
