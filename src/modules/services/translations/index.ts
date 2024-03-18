import { StatusCodes } from 'http-status-codes';

import { config } from '../../../config';
import { BaseError } from '../../../errors/BaseError';
import type { ModuleAssets } from '../../../middlewares/moduleAssets';
import { db } from '../../db';
import { getIso639_1 } from '../../languages/iso639-1';
import { traslationToPublic } from '.';

export * from './link-files';
export * from './to-public';

/**
 * Returns an 'author' object, along with related resources
 * @since 1.0.0
 */
export const fetchTranslationToPublic = async (moduleAssets: ModuleAssets, translationId: number) => {
  const DbTranslation = await db.translation.findUnique({
    where: {
      id: translationId,
    },
    include: {
      song: true,
    },
  });
  if (!DbTranslation) {
    throw new BaseError('not-found', 'author not found', StatusCodes.NOT_FOUND);
  }

  // public interface
  return traslationToPublic(moduleAssets, DbTranslation);
};

/**
 * @since 1.0.0
 * @todo add filters
 */
export const listTranslationsToPublic = async (moduleAssets: ModuleAssets) => {
  const DbTranslationList = await db.translation.findMany();

  // public interface
  return DbTranslationList.map((DbTranslation) => traslationToPublic(moduleAssets, DbTranslation));
};

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
