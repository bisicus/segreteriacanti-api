import * as dotenv from 'dotenv';

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
};
