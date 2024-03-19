import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../../errors/BaseError';
import type { ModuleAssets } from '../../../middlewares/moduleAssets';
import { db } from '../../db';
import { eventToPublic } from '.';
import { parseSearchFilters } from './search-filters';

export * from './to-public';

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
 */
export const listEventsToPublic = async (moduleAssets: ModuleAssets, filters: Record<string, string | string[]> = {}) => {
  const parsedFilter = filters ? parseSearchFilters(filters) : {};
  const DbEventList = await db.event.findMany({
    where: parsedFilter,
  });

  // public interface
  return DbEventList.map((DbEvent) => eventToPublic(moduleAssets, DbEvent));
};
