import * as dotenv from 'dotenv';
import mime from 'mime';
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
        import: [mime.lookup('csv')],
        lyrics: [mime.lookup('doc'), mime.lookup('docx'), mime.lookup('txt'), mime.lookup('pdf')],
        scores: [mime.lookup('pdf')],
        tablatures: [mime.lookup('doc'), mime.lookup('docx'), mime.lookup('txt'), mime.lookup('pdf')],
      },
    },
    import: {
      csv: {
        delimiters: [';', ','],
        arraySeparator: '..',
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
    lyrics: path.join(defaults__folders_storageMain, 'lyrics'),
    scores: path.join(defaults__folders_storageMain, 'scores'),
    tablatures: path.join(defaults__folders_storageMain, 'tablatures'),
    tmp: path.join(defaults__folders_storageMain, 'tmp'),
  },
};
