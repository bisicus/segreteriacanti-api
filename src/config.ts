import * as dotenv from 'dotenv';
import type { Level } from 'pino';

// Load .env
dotenv.config();

// Scan for required variables
const requiredEnvVars: string[] = ['DATABASE_URL'];

const missingRequiredEnvVars = requiredEnvVars.filter((_envVar) => !(_envVar in process.env));
if (missingRequiredEnvVars.length !== 0) {
  throw new Error(`missing required env variables [${missingRequiredEnvVars.join(', ')}]`);
}

export const config = {
  NODE_ENV: process.env['NODE_ENV'] || 'production',

  server: {
    httpPort: Number.isNaN(Number(process.env['SERVER__HTTP_PORT'])) === false ? Number(process.env['SERVER__HTTP_PORT']) : 80,
  },

  db: {
    connectionUrl: String(process.env['DATABASE_URL']),
  },

  logging: {
    level: <Level>process.env['LOGGING__LEVEL_APP'] || 'debug',
    prettyPrint: ['yes', 'y', '1', 'true'].includes(String(process.env['LOGGING__PRETTYPRINT']).toLowerCase()),
    printLevelAsLabel: ['yes', 'y', '1', 'true'].includes(String(process.env['LOGGING__LEVEL_AS_LABEL']).toLowerCase()),
    printTime: process.env['LOGGING__PRINT_TIME'] || 'epoch',
  },
};
