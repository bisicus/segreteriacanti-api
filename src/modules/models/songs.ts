import type { Song } from '@prisma/client';
import { extension } from 'mime-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * creates unique name for file ref
 * use `refLyrics` or uuid
 * @since 1.0.0
 * @todo support user input (that must be sanified)
 */
export const forgeFileRefValueLyrics = (song: Song, fileMime: string) => {
  let fileRef: string = song.refLyrics ?? uuidv4();
  if (fileMime) {
    fileRef = `${fileRef}.${extension(fileMime)}`;
  }
  return fileRef;
};

/**
 * creates unique name for file ref
 * use `refScore` or uuid
 * @since 1.0.0
 * @todo support user input (that must be sanified)
 */
export const forgeFileRefValueScore = (song: Song, fileMime: string) => {
  let fileRef: string = song.refScore ?? uuidv4();
  if (fileMime) {
    fileRef = `${fileRef}.${extension(fileMime)}`;
  }
  return fileRef;
};

/**
 * creates unique name for file ref
 * use `refTablature` or uuid
 * @since 1.0.0
 * @todo support user input (that must be sanified)
 */
export const forgeFileRefValueTablature = (song: Song, fileMime: string) => {
  let fileRef: string = song.refTablature ?? uuidv4();
  if (fileMime) {
    fileRef = `${fileRef}.${extension(fileMime)}`;
  }
  return fileRef;
};
