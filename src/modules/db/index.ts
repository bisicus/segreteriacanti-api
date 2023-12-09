import { PrismaClient } from '@prisma/client';

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
  });

// @todo use a settings file instead of `process.env`
if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = db;
}
