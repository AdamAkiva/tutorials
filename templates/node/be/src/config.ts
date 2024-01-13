/**********************************************************************************/

type Mode = 'development' | 'production' | 'test';
type EnvironmentVariables = {
  mode: Mode;
  server: {
    port: string;
    url: string;
    apiRoute: string;
    healthCheckRoute: string;
    allowedOrigins: string[] | string;
  };
};

/**********************************************************************************/

let env: EnvironmentVariables | undefined = undefined;
export const getEnv = () => {
  if (env) {
    return env;
  }

  const mode = process.env.NODE_ENV as Mode;
  checkRuntimeEnv(mode);
  checkEnvVariables(mode);

  env = {
    mode: mode,
    server: {
      port: process.env.SERVER_PORT!,
      url: process.env.SERVER_URL!,
      apiRoute: process.env.API_ROUTE!,
      healthCheckRoute: process.env.HEALTH_CHECK_ROUTE!,
      allowedOrigins:
        typeof process.env.ALLOWED_ORIGINS === 'string' && mode !== 'production'
          ? process.env.ALLOWED_ORIGINS!
          : process.env.ALLOWED_ORIGINS!.split(',')
    }
  };

  return env;
};

const checkRuntimeEnv = (mode?: string | undefined): mode is Mode => {
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
  checkMissingEnvVariables(mode).forEach((val, key) => {
    if (!process.env[key]) {
      missingValues += `* ${val}\n`;
    }
  });
  if (missingValues) {
    console.error(`\nMissing the following env vars: ${missingValues}`);

    process.kill(process.pid, 'SIGTERM');
    throw new Error('Graceful shutdown');
  }
};

const checkMissingEnvVariables = (mode: Mode) => {
  const errMap = new Map<string, string>([
    ['SERVER_PORT', `Missing 'SERVER_PORT', env variable`],
    ['SERVER_URL', `Missing 'SERVER_URL', env variable`],
    ['API_ROUTE', `Missing 'API_ROUTE', env variable`],
    ['HEALTH_CHECK_ROUTE', `Missing 'HEALTH_CHECK_ROUTE', env variable`],
    ['ALLOWED_ORIGINS', `Missing 'ALLOWED_ORIGINS', env variable`]
  ]);

  if (mode === 'development') {
    errMap.set(
      'SERVER_DEBUG_PORT',
      `Missing 'SERVER_DEBUG_PORT', env variable`
    );
  }

  return errMap;
};
