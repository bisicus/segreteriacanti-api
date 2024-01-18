import type { Song } from '@prisma/client';
import fs from 'fs-extra';
import { StatusCodes } from 'http-status-codes';
import path from 'path';

import { config } from '../../../config';
import { BaseError } from '../../../errors/BaseError';
import type { ModuleAssets } from '../../../middlewares/moduleAssets';
import type { ExtractPropertiesWithPrefix } from '../../../types';
import { db } from '../../db';
import { songToPublic } from '../../to-public/song';
import type { _SongFileType } from './utils';
import { _fetchSong } from './utils';

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

//////////////////////////////
/////   FILES DOWNLOAD   /////
//////////////////////////////

/**
 * @since 1.0.0
 * @todo check file MIME
 * @todo provide filename that is not the ref
 */
export const getSongFileLyrics = async (moduleAssets: ModuleAssets, songId: number) => {
  return await _getSongFile(moduleAssets, songId, 'lyrics');
};

/**
 * @since 1.0.0
 * @todo check file MIME
 * @todo provide filename that is not the ref
 */
export const getSongFileScore = async (moduleAssets: ModuleAssets, songId: number) => {
  return await _getSongFile(moduleAssets, songId, 'score');
};

/**
 * @since 1.0.0
 * @todo check file MIME
 * @todo provide filename that is not the ref
 */
export const getSongFileTablature = async (moduleAssets: ModuleAssets, songId: number) => {
  return await _getSongFile(moduleAssets, songId, 'tablature');
};

/**
 * Common method to fetch a file of a song using a reference.
 * @since 1.0.0
 */
const _getSongFile = async (moduleAssets: ModuleAssets, songId: number, fileType: _SongFileType) => {
  const DbSong = await _fetchSong(songId);

  /** properties of 'Song' that involves a file reference */
  let _fileReferenceProperty: ExtractPropertiesWithPrefix<Song, 'ref'>;
  switch (fileType) {
    case 'lyrics':
      _fileReferenceProperty = 'refLyrics';
      break;
    case 'score':
      _fileReferenceProperty = 'refScore';
      break;
    case 'tablature':
      _fileReferenceProperty = 'refTablature';
      break;
    default:
      moduleAssets.logger.error({ songId, type: fileType }, 'invalid file type');
      throw new BaseError('not-found', 'file not found', StatusCodes.NOT_IMPLEMENTED);
  }

  const refName = DbSong[_fileReferenceProperty];
  if (refName === null) {
    throw new BaseError('not-found', 'file not found', StatusCodes.NOT_FOUND);
  }
  const filepath = path.join(config.storage.recordings, refName);
  if (fs.existsSync(filepath) === false) {
    moduleAssets.logger.fatal({ path: filepath, songId, type: fileType }, 'non-existent file');
    throw new BaseError('not-found', 'file not available', StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return { filepath: filepath, filename: refName };
};
