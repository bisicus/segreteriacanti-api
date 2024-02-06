import type { Song } from '@prisma/client';
import { extension } from 'mime-types';

import { sanifiedSongTitle } from './songs';

/**
 * creates unique name for file ref using song title, language and extension of input file
 * @since 1.0.0
 * @todo hard-constrained type for `language`
 */
export const forceFileRefValue = (song: Song, language: string, fileMime: string) => {
  const songTitle = sanifiedSongTitle(song);
  const fileExtension = extension(fileMime);

  let refValue = `${songTitle}--${language}`;
  if (fileExtension) {
    refValue = `${refValue}.${fileExtension}`;
  }

  return refValue;
};
