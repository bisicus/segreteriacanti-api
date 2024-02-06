import type { Song, Translation } from '@prisma/client';
import fs from 'fs-extra';
import { StatusCodes } from 'http-status-codes';
import path from 'path';

import { config } from '../../../config';
import { BaseError } from '../../../errors/BaseError';
import type { ModuleAssets } from '../../../middlewares/moduleAssets';
import { db } from '../../db';
import { forceFileRefValue } from '../../models/translations';
import { extractLanguageFromFilename } from '.';

interface _TranslationFileLinkElem {
  /** temporary path storing the uploaded file */
  uploadPath: string;

  /** destination path of the new file */
  destinationPath: string;

  /** @todo language enum */
  language: string;

  relatedModel: Translation | undefined;

  /** file has been successfully moved from `uploadPath` to `newRefFilepath` */
  moveSuccess: boolean | undefined;

  /** name of the ref for the new file */
  newRefValue: string;
}

/**
 * "File move" descriptor after move is accomplished
 * @since 1.0.0
 */
interface _TranslationFileLinkAfterMove extends _TranslationFileLinkElem {
  moveSuccess: true;
}

/**
 * Set of "file move" descriptors
 * @since 1.0.0
 */
export type TranslationFileLinkStruct = _TranslationFileLinkElem[];

/**
 * Set of "file move" descriptors after move is successfull
 * @since 1.0.0
 */
type TranslationFileLinkStructAfterMove = _TranslationFileLinkAfterMove[];

/**
 * Flow
 * ----
 * 1. move all files from their tmp location to the correct storage folder
 * 2. create missing translation models; update existing model properties with new `ref`
 * @since 1.0.0
 * @todo handle rollback both on files and models
 * @todo add archive of replaced ref files
 */
export const linkUploadedTranslations = async (moduleAssets: ModuleAssets, DbSong: Song, files: Express.Multer.File[]): Promise<Song> => {
  const supportStruct = await _createSupportStructure(moduleAssets, DbSong, files);

  // move files
  const supportStructAfterMove = await _moveFiles(moduleAssets, supportStruct, DbSong);

  // create or update translation models
  await _createOrUpdateTranslationModels(moduleAssets, DbSong, supportStructAfterMove);

  return DbSong;
};

const _createSupportStructure = async (
  moduleAssets: ModuleAssets,
  DbSong: Song,
  files: Express.Multer.File[]
): Promise<TranslationFileLinkStruct> => {
  const relatedDbTranslation = await db.translation.findMany({
    where: {
      song: DbSong,
    },
  });

  return files.map((file): _TranslationFileLinkElem => {
    // extract language from filename
    const language = extractLanguageFromFilename(file);

    const refValue = forceFileRefValue(DbSong, language, file.mimetype);

    return {
      destinationPath: path.join(config.storage.translations, refValue),
      language,
      moveSuccess: undefined,
      relatedModel: relatedDbTranslation.find((t) => t.language === language),
      uploadPath: file.path,
      newRefValue: refValue,
    };
  });
};

/**
 * @since 1.0.0
 * @todo rollback
 * @todo what if new ref name is the same as the one of another song?
 * @todo status code if any resource is in use
 */
const _moveFiles = async (
  moduleAssets: ModuleAssets,
  supportStruct: TranslationFileLinkStruct,
  DbSong: Song
): Promise<TranslationFileLinkStructAfterMove> => {
  // move files
  const fsmovePromises = supportStruct.map(async (fileDescriptor) => {
    try {
      await fs.move(fileDescriptor.uploadPath, fileDescriptor.destinationPath, { overwrite: true });
      fileDescriptor.moveSuccess = true;
    } catch (err) {
      moduleAssets.logger.error(
        { err: err, oldPath: fileDescriptor.uploadPath, newPath: fileDescriptor.destinationPath, songId: DbSong.id },
        `FAILED: file 'translation' replacement`
      );
      fileDescriptor.moveSuccess = false;
    }

    return fileDescriptor;
  });

  const _supportStructAfterMove = await Promise.all(fsmovePromises);
  const failedMove = _supportStructAfterMove.filter((moveAttempt) => moveAttempt.moveSuccess !== true);
  const successMove = _supportStructAfterMove.filter((moveAttempt) => moveAttempt.moveSuccess === true) as TranslationFileLinkStructAfterMove;

  if (failedMove.length) {
    // rollback
    throw new BaseError('TODO', '', StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return successMove;
};

/**
 * Iterates support struct:
 * - if not related translations model create a new one
 * - if already present, updates ref value
 * @since 1.0.0
 * @todo specify return type with no `undefined` in 'relatedModel'
 */
const _createOrUpdateTranslationModels = async (
  moduleAssets: ModuleAssets,
  DbSong: Song,
  supportStruct: TranslationFileLinkStructAfterMove
): Promise<TranslationFileLinkStructAfterMove> => {
  supportStruct = await Promise.all(
    supportStruct.map(async (elem) => {
      // create the model
      const DbTranslation = await db.translation.upsert({
        where: {
          id: elem.relatedModel?.id ?? -1,
        },
        create: {
          language: elem.language,
          refText: elem.newRefValue,
          createdBy: moduleAssets.sessionId,
          updatedBy: moduleAssets.sessionId,
          song: {
            connect: DbSong,
          },
        },
        update: {
          refText: elem.newRefValue,
          updatedBy: moduleAssets.sessionId,
        },
      });

      elem.relatedModel = DbTranslation;

      return elem;
    })
  );

  return supportStruct;
};
