import { StatusCodes } from 'http-status-codes';

import { config } from '../../../config';
import { BaseError } from '../../../errors/BaseError';
import { getIso639_1 } from '../../languages/iso639-1';

export * from './link-files';

/**
 * creates unique name for file ref using song title, language and extension of input file
 * @since 1.0.0
 */
export const extractLanguageFromFilename = (file: Express.Multer.File): string => {
  // remove extension
  const filename = file.originalname.split('.').at(0) as string;

  const language = filename.split(config.application.song.translations.filenameSeparator).at(-1);
  if (!language) {
    throw new BaseError('valiidation', 'filename does not contain a language', StatusCodes.BAD_REQUEST);
  }

  // validate language
  const parsedLanguage = getIso639_1(language);
  if (!parsedLanguage) {
    throw new BaseError('valiidation', `invalid language code '${language}'`, StatusCodes.BAD_REQUEST);
  }

  return parsedLanguage.toLowerCase();
};
