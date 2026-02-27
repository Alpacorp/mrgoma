import { DB_NAME, DB_PASSWORD, DB_USER, SERVER_URL } from '@config/constants';
import { config as dotenvConfig } from 'dotenv';
import { ConnectionPool, config as SqlConfig } from 'mssql';

import { DatabaseConnectionError } from '@/errors/DatabaseConnectionError';
import { logger } from '@/utils/logger';

dotenvConfig();

const config: SqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  server: SERVER_URL ?? 'localhost',
  database: DB_NAME,
  options: {
    encrypt: true, // Utilizar si estás en Azure
    trustServerCertificate: true, // Utilizar si el SQL Server usa certificados auto-firmados
  },
};

const poolPromise: Promise<ConnectionPool> = new ConnectionPool(config)
  .connect()
  .then(pool => {
    logger.info('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    logger.error('Database connection failed', err);
    throw new DatabaseConnectionError(err.message);
  });

export const getPool = async (): Promise<ConnectionPool> => poolPromise;

export const closePool = async (): Promise<void> => {
  try {
    const pool = await poolPromise;
    await pool.close();
    logger.info('Database connection closed');
  } catch (err) {
    logger.error('Error closing database connection', err);
  }
};
export { poolPromise };
