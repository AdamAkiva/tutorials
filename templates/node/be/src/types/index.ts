import { createServer, type Server } from 'node:http';
import { inspect } from 'node:util';

import compress from 'compression';
import cors from 'cors';
import express, {
  type Application,
  type Request as ExpressRequest
} from 'express';
import type core from 'express-serve-static-core';
import type qs from 'qs';

/**********************************************************************************/

export type UnknownObject = { [key: string]: unknown };
export type Maybe<T> = T | undefined;
export type MaybeArray<T> = T | T[];

export type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>;
export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & T;

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

export type Request = ExpressRequest<
  core.ParamsDictionary,
  UnknownObject,
  UnknownObject,
  qs.ParsedQs,
  UnknownObject
>;

/**********************************************************************************/

export {
  compress,
  cors,
  createServer,
  express,
  inspect,
  type Application,
  type Server
};
