import { createLogger, format, transports } from 'winston';

const isProd = process.env.NODE_ENV === 'production';

// Verbose by default in development, quieter (info) in production.
// Override anytime with LOG_LEVEL (e.g. LOG_LEVEL=debug in Vercel to see db_query_ok).
const level = process.env.LOG_LEVEL || (isProd ? 'info' : 'debug');

// In production we keep structured JSON (best for Vercel log search / drains).
// In development we print a compact, readable line with the metadata inlined.
const devFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'HH:mm:ss.SSS' }),
  format.printf(({ level: lvl, message, timestamp, stack, ...meta }) => {
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${lvl} ${stack || message}${rest}`;
  })
);

const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

const logger = createLogger({
  level,
  format: isProd ? prodFormat : devFormat,
  transports: [new transports.Console()],
});

export { logger };
