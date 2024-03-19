import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../../errors/BaseError';
import type { ModuleAssets } from '../../../middlewares/moduleAssets';
import { db } from '../../db';
import { parseSearchFilters } from './search-filters';
import { authorToPublic } from './to-public';

export * from './to-public';

/**
 * Returns an 'author' object, along with related resources
 * @since 1.0.0
 */
export const fetchAuthorToPublic = async (moduleAssets: ModuleAssets, authorId: number) => {
  const DbAuthor = await db.author.findUnique({
    where: {
      id: authorId,
    },
    include: {
      songs: true,
    },
  });
  if (!DbAuthor) {
    throw new BaseError('not-found', 'author not found', StatusCodes.NOT_FOUND);
  }

  // public interface
  return authorToPublic(moduleAssets, DbAuthor);
};

/**
 * @since 1.0.0
 */
export const listAuthorsToPublic = async (moduleAssets: ModuleAssets, filters: Record<string, string | string[]> = {}) => {
  const parsedFilter = filters ? parseSearchFilters(filters) : {};
  const DbSongList = await db.author.findMany({
    where: parsedFilter,
  });

  // public interface
  return DbSongList.map((DbAuthor) => authorToPublic(moduleAssets, DbAuthor));
};
