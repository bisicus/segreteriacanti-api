import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../../errors/BaseError';
import type { ModuleAssets } from '../../../middlewares/moduleAssets';
import { db } from '../../db';
import { momentToPublic } from '../../to-public/moment';

/**
 * Returns an 'moment' object, along with related resources
 * @since 1.0.0
 */
export const fetchMomentToPublic = async (moduleAssets: ModuleAssets, momentId: number) => {
  const DbMoment = await db.moment.findUnique({
    where: {
      id: momentId,
    },
    include: {
      recordings: true,
    },
  });
  if (!DbMoment) {
    throw new BaseError('not-found', 'author not found', StatusCodes.NOT_FOUND);
  }

  // public interface
  return momentToPublic(moduleAssets, DbMoment);
};

/**
 * @since 1.0.0
 * @todo add filters
 */
export const listMomentsToPublic = async (moduleAssets: ModuleAssets) => {
  const DbMomentList = await db.moment.findMany();

  // public interface
  return DbMomentList.map((DbMoment) => momentToPublic(moduleAssets, DbMoment));
};
