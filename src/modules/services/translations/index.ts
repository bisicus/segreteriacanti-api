import { StatusCodes } from 'http-status-codes';

import { config } from '../../../config';
import { BaseError } from '../../../errors/BaseError';

/**
 * creates unique name for file ref using song title, language and extension of input file
 * @since 1.0.0
 * @todo hard-constrained type for `language` (along with validation)
 */
export const extractLanguageFromFilename = (file: Express.Multer.File): string => {
  // remove extension
  const filename = file.originalname.split('.').at(0) as string;

  let language = filename.split(config.application.song.translations.filenameSeparator).at(-1);
  if (!language) {
    throw new BaseError('valiidation', 'filename does not contain a valid language', StatusCodes.BAD_REQUEST);
  }

  language = language.toLowerCase();
  return language;
};
