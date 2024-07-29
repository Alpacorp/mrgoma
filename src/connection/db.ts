import { config as dotenvConfig } from 'dotenv';
import { ConnectionPool, config as SqlConfig } from 'mssql';
import { DB_NAME, DB_PASSWORD, DB_USER, SERVER_URL } from '@config/constants';

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
  .then((pool) => {
    console.log('Conectado a SQL Server');
    return pool;
  })
  .catch((err) => {
    console.error('Conexión a la Base de Datos Fallida: ', err);
    throw err;
  });

export { poolPromise };
