import * as dotenv from 'dotenv';
import path from 'path';
import type { Level } from 'pino';

// Load .env
dotenv.config();

// Scan for required variables
const requiredEnvVars: string[] = ['DATABASE_URL'];

const missingRequiredEnvVars = requiredEnvVars.filter((_envVar) => !(_envVar in process.env));
if (missingRequiredEnvVars.length !== 0) {
  throw new Error(`missing required env variables [${missingRequiredEnvVars.join(', ')}]`);
}

// reusable variables //
const defaults__folders_storageMain = path.join(process.cwd(), 'storage');

//////////////////////
/////   CONFIG   /////
//////////////////////

export const config = {
  NODE_ENV: process.env['NODE_ENV'] || 'production',

  server: {
    httpPort: Number.isNaN(Number(process.env['SERVER__HTTP_PORT'])) === false ? Number(process.env['SERVER__HTTP_PORT']) : 80,
  },

  db: {
    connectionUrl: String(process.env['DATABASE_URL']),
  },

  application: {
    uploads: {
      acceptedMime: {
        audio: ['audio/mpeg', 'audio/mp4', 'audio/vnd.wav'],
      },
    },
  },

  logging: {
    level: <Level>process.env['LOGGING__LEVEL_APP'] || 'debug',
    prettyPrint: ['yes', 'y', '1', 'true'].includes(String(process.env['LOGGING__PRETTYPRINT']).toLowerCase()),
    printLevelAsLabel: ['yes', 'y', '1', 'true'].includes(String(process.env['LOGGING__LEVEL_AS_LABEL']).toLowerCase()),
    printTime: process.env['LOGGING__PRINT_TIME'] || 'epoch',
  },

  storage: {
    main: defaults__folders_storageMain,
    recordings: path.join(defaults__folders_storageMain, 'recordings'),
    tmp: path.join(defaults__folders_storageMain, 'tmp'),
  },
};
