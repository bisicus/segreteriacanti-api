import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../errors/BaseError';
import type { ModuleAssets } from '../../middlewares/moduleAssets';
import { db } from '../db';
import { songToPublic } from '../to-public/song';

/**
 * Returns a 'song' object, along with related resources
 * @since 1.0.0
 */
export const fetchSongToPublic = async (moduleAssets: ModuleAssets, songId: number) => {
  const DbSong = await db.song.findUnique({
    where: {
      id: songId,
    },
    include: {
      authors: true,
      recordings: true,
    },
  });
  if (!DbSong) {
    throw new BaseError('not-found', 'recording not found', StatusCodes.NOT_FOUND);
  }

  // public interface
  return songToPublic(moduleAssets, DbSong);
};
