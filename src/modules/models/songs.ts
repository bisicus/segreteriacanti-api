import type { Song } from '@prisma/client';
import { extension } from 'mime-types';

/**
 * creates unique name for file ref using song title and extension of input file
 * @since 1.0.0
 */
export const forgeFileRefValueLyrics = (song: Song, fileMime: string) => {
  const songTitle = sanifiedSongTitle(song);
  const fileExtension = extension(fileMime);

  let refValue = `${songTitle}--lyrics`;
  if (fileExtension) {
    refValue = `${refValue}.${fileExtension}`;
  }

  return refValue;
};

/**
 * creates unique name for file ref using song title and extension of input file
 * @since 1.0.0
 */
export const forgeFileRefValueScore = (song: Song, fileMime: string) => {
  const songTitle = sanifiedSongTitle(song);
  const fileExtension = extension(fileMime);

  let refValue = `${songTitle}--score`;
  if (fileExtension) {
    refValue = `${refValue}.${fileExtension}`;
  }

  return refValue;
};

/**
 * creates unique name for file ref using song title and extension of input file
 * @since 1.0.0
 */
export const forgeFileRefValueTablature = (song: Song, fileMime: string) => {
  const songTitle = sanifiedSongTitle(song);
  const fileExtension = extension(fileMime);

  let refValue = `${songTitle}--tablature`;
  if (fileExtension) {
    refValue = `${refValue}.${fileExtension}`;
  }

  return refValue;
};

/**
 * get sanified song title
 * - replace all sequential whitespaces with a single underscore
 * - lowercase
 * @since 1.0.0
 */
export const sanifiedSongTitle = (song: Song) => {
  return song.title.replace(/\s+/g, '_').toLowerCase();
};
