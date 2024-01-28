/*
 * Set method common to all files within this module but should not be exported outside
 */

import type { Song } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../../errors/BaseError';
import { db } from '../../db';

/**
 * Available options for song file downloading
 * @since 1.0.0
 */
export type _SongFileType = 'lyrics' | 'score' | 'tablature';

/**
 * Fetch a song by id. Throws if not found
 * @since 1.0.0
 */
export const _fetchSong = async (songId: number): Promise<Song> => {
  const DbSong = await db.song.findUnique({
    where: {
      id: songId,
    },
  });
  if (!DbSong) {
    throw new BaseError('not-found', 'recording not found', StatusCodes.NOT_FOUND);
  }

  return DbSong;
};
