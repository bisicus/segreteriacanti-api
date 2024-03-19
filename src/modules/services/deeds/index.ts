import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../../errors/BaseError';
import type { ModuleAssets } from '../../../middlewares/moduleAssets';
import { db } from '../../db';
import { deedToPublic } from '.';
import { parseSearchFilters } from './search-filters';

export * from './to-public';

/**
 * Returns an 'deed' object, along with related resources
 * @since 1.0.0
 */
export const fetchDeedToPublic = async (moduleAssets: ModuleAssets, deedId: number) => {
  const DbDeed = await db.deed.findUnique({
    where: {
      id: deedId,
    },
    include: {
      recordings: true,
    },
  });
  if (!DbDeed) {
    throw new BaseError('not-found', 'author not found', StatusCodes.NOT_FOUND);
  }

  // public interface
  return deedToPublic(moduleAssets, DbDeed);
};

/**
 * @since 1.0.0
 * @todo add filters
 */
export const listDeedsToPublic = async (moduleAssets: ModuleAssets, filters: Record<string, string | string[]> = {}) => {
  const parsedFilter = filters ? parseSearchFilters(filters) : {};
  const DbDeedList = await db.deed.findMany({
    where: parsedFilter,
  });

  // public interface
  return DbDeedList.map((DbDeed) => deedToPublic(moduleAssets, DbDeed));
};
