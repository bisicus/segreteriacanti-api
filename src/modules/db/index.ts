import { PrismaClient } from '@prisma/client';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

import { config } from '../../config';

/**
 * global variable used to prevent hot-reloading in develop environment like nodemon
 * @see {@link https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#prevent-hot-reloading-from-creating-new-instances-of-prismaclient}
 * @since 1.0.0
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * DB connection
 * @since 1.0.0
 */
export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    errorFormat: 'minimal',
  }).$extends(
    createSoftDeleteExtension({
      models: {
        Canto: true,
        Autore: true,
        Registrazione: true,
        Evento: true,
        Gesto: true,
        Momento: true,
      },
      defaultConfig: {
        field: 'deletedAt',
        createValue: (deleted) => {
          if (deleted) return new Date();
          return null;
        },
      },
    })
  );

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
