/**
 * Retrieves an environment variable and throws an error if it is not defined.
 * Using this helper prevents runtime errors caused by missing configuration
 * and avoids leaking sensitive values to the client.
 */
const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
};

// These variables are intended for server-side usage only and therefore do not
// use the NEXT_PUBLIC_ prefix.
export const SERVER_URL = requireEnv('SERVER_URL');
export const DB_NAME = requireEnv('DB_NAME');
export const DB_USER = requireEnv('DB_USER');
export const DB_PASSWORD = requireEnv('DB_PASSWORD');
