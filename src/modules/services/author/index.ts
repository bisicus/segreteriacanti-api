import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../../errors/BaseError';
import type { ModuleAssets } from '../../../middlewares/moduleAssets';
import { db } from '../../db';
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
 * @todo add filters
 */
export const listAuthorsToPublic = async (moduleAssets: ModuleAssets) => {
  const DbAuthorsList = await db.author.findMany();

  // public interface
  return DbAuthorsList.map((DbAuthor) => authorToPublic(moduleAssets, DbAuthor));
};
