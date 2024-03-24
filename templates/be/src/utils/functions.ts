export function isDevelopmentMode(mode?: string) {
  return mode === 'development';
}

export function isTestMode(mode?: string) {
  return mode === 'test';
}

export function isProductionMode(mode?: string) {
  return mode === 'production';
}
