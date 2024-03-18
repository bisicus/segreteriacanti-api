import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../../errors/BaseError';
import type { ModuleAssets } from '../../../middlewares/moduleAssets';
import { db } from '../../db';
import { eventToPublic } from '../../to-public/event';

/**
 * Returns an 'event' object, along with related resources
 * @since 1.0.0
 */
export const fetchEventToPublic = async (moduleAssets: ModuleAssets, eventId: number) => {
  const DbEvent = await db.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      recordings: true,
    },
  });
  if (!DbEvent) {
    throw new BaseError('not-found', 'author not found', StatusCodes.NOT_FOUND);
  }

  // public interface
  return eventToPublic(moduleAssets, DbEvent);
};

/**
 * @since 1.0.0
 * @todo add filters
 */
export const listEventsToPublic = async (moduleAssets: ModuleAssets) => {
  const DbEventList = await db.event.findMany();

  // public interface
  return DbEventList.map((DbEvent) => eventToPublic(moduleAssets, DbEvent));
};
