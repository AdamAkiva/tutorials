import { createServer } from 'node:http';
import { resolve } from 'node:path';

import compress from 'compression';
import cors from 'cors';
import express from 'express';

import { getEnv } from './config.js';
import { ERR_CODES, StatusCodes, generalDebug } from './constants.js';
import NodeTemplateError from './error.js';
import {
  debugEnabled,
  filterNullAndUndefined,
  isDevelopmentMode,
  isProductionMode,
  isTestMode,
  objHasValues,
  strcasecmp
} from './functions.js';
import Logger from './logger.js';

import type {
  AddOptional,
  AddRequired,
  AddressInfo,
  Application,
  CorsOptions,
  EnvironmentVariables,
  MaybeArray,
  Mode,
  NextFunction,
  Request,
  RequestContext,
  ResolvedValue,
  Response,
  SwapKeysValue,
  UnknownObject
} from './types/index.js';

/**********************************************************************************/

export {
  ERR_CODES,
  Logger,
  NodeTemplateError,
  StatusCodes,
  compress,
  cors,
  createServer,
  debugEnabled,
  express,
  filterNullAndUndefined,
  generalDebug,
  getEnv,
  isDevelopmentMode,
  isProductionMode,
  isTestMode,
  objHasValues,
  resolve,
  strcasecmp,
  type AddOptional,
  type AddRequired,
  type AddressInfo,
  type Application,
  type CorsOptions,
  type EnvironmentVariables,
  type MaybeArray,
  type Mode,
  type NextFunction,
  type Request,
  type RequestContext,
  type ResolvedValue,
  type Response,
  type SwapKeysValue,
  type UnknownObject
};
