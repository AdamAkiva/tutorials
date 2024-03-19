import type { EnvironmentVariables, Mode } from '../types/index.js';

/**********************************************************************************/

export const getEnv = (): EnvironmentVariables => {
  const mode = process.env.NODE_ENV as Mode;

  checkRuntimeEnv(mode);
  checkEnvVariables(mode);

  return {
    mode: mode,
    server: {
      port: process.env.SERVER_PORT!,
      url: process.env.SERVER_URL!,
      apiRoute: process.env.API_ROUTE!,
      healthCheckRoute: process.env.HEALTH_CHECK_ROUTE!,
      allowedOrigins: new Set(process.env.ALLOWED_ORIGINS!.split(','))
    }
  };
};

const checkRuntimeEnv = (mode?: string): mode is Mode => {
  if (
    mode &&
    (mode === 'development' || mode === 'test' || mode === 'production')
  ) {
    return true;
  }

  console.error(
    `Missing or invalid 'NODE_ENV' env value, should never happen.` +
      ' Unresolvable, exiting...'
  );

  process.kill(process.pid, 'SIGTERM');
  throw new Error('Graceful shutdown');
};

const checkEnvVariables = (mode: Mode) => {
  let missingValues = '';
  checkMissingEnvVariables(mode).forEach((val) => {
    if (!process.env[val]) {
      missingValues += `* Missing ${val} environment variable\n`;
    }
  });
  if (missingValues) {
    console.error(`\nMissing the following env vars: ${missingValues}`);

    process.kill(process.pid, 'SIGTERM');
    throw new Error('Graceful shutdown');
  }
};

const checkMissingEnvVariables = (mode: Mode) => {
  const envVars = [
    'SERVER_PORT',
    'SERVER_URL',
    'API_ROUTE',
    'HEALTH_CHECK_ROUTE',
    'ALLOWED_ORIGINS'
  ];

  if (mode === 'development') {
    envVars.push('SERVER_DEBUG_PORT');
  }

  return envVars;
};
