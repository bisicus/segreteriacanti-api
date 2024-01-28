import type { Song } from '@prisma/client';
import fs from 'fs-extra';
import { StatusCodes } from 'http-status-codes';
import path from 'path';

import { config } from '../../../config';
import { BaseError } from '../../../errors/BaseError';
import type { ModuleAssets } from '../../../middlewares/moduleAssets';
import type { ExtractPropertiesWithPrefix } from '../../../types';
import { db } from '../../db';
import { forgeFileRefValueLyrics, forgeFileRefValueScore, forgeFileRefValueTablature } from '../../models/songs';
import type { _SongFileType } from './utils';
import { _fetchSong } from './utils';

////////////////////////////
/////   FILES UPLOAD   /////
////////////////////////////

/**
 * Descriptor for a file move, pointing to a model ref
 * @since 1.0.0
 * @todo add archive of replaced ref files
 */
interface _FileLinkElem {
  /** property of the model that stores the ref name */
  modelRefProperty: ExtractPropertiesWithPrefix<Song, 'ref'>;
  /** name of the ref for the new file */
  newRefValue: string;
  /** path of the file that is replaced  */
  pathToDelete: string | null;
  /** destination path of the new file */
  newRefFilepath: string;
  /** temporary path storing the uploaded file */
  uploadPath: string;
  /** file has been successfully moved from `uploadPath` to `newRefFilepath` */
  moveSuccess: boolean | undefined;
}

/**
 * "File move" descriptor after move is accomplished
 * @since 1.0.0
 */
interface _FileLinkElemAfterMove extends _FileLinkElem {
  moveSuccess: true;
}

/**
 * Set of "file move" descriptors
 * @since 1.0.0
 */
type FileLinkStruct = _FileLinkElem[];

/**
 * Set of "file move" descriptors after move is successfull
 * @since 1.0.0
 */
type FileLinkStructAfterMove = _FileLinkElemAfterMove[];

/**
 * Flow
 * ----
 * 1. move all files from their tmp location to the correct storage folder
 * 2. update model properties with new `ref`
 * 3. delete replaced files
 * @since 1.0.0
 * @todo add archive of replaced ref files
 */
export const linkUploadedFiles = async (moduleAssets: ModuleAssets, songId: number, files: Record<string, Express.Multer.File>): Promise<Song> => {
  let DbSong = await _fetchSong(songId);

  const supportStruct = _createSupportStructure(moduleAssets, DbSong, files);

  // move uploaded files to relative ref directories
  const supportStructAfterMove = await _moveFiles(moduleAssets, supportStruct, DbSong);

  // update model
  DbSong = await _updateModelRef(moduleAssets, DbSong, supportStructAfterMove);

  // remove old files, if any
  await _deleteOldFiles(moduleAssets, DbSong, supportStructAfterMove);

  return DbSong;
};

/**
 * @since 1.0.0
 * @todo add archive of replaced ref files
 */
const _createSupportStructure = (moduleAssets: ModuleAssets, DbSong: Song, files: Record<string, Express.Multer.File>): FileLinkStruct => {
  return Object.entries(files).map(([fieldname, file]): _FileLinkElem => {
    moduleAssets.logger.debug({ filename: file.filename, mime: file.mimetype, songId: DbSong.id }, `handling file '${fieldname}' for song`);

    /** properties of 'Song' that involves a file reference */
    let modelRefProperty: ExtractPropertiesWithPrefix<Song, 'ref'>;
    let storageFolder: string;
    let newRefValue: string;

    switch (fieldname as _SongFileType) {
      case 'lyrics':
        newRefValue = forgeFileRefValueLyrics(DbSong, file.mimetype);
        modelRefProperty = 'refLyrics';
        storageFolder = config.storage.lyrics;
        break;
      case 'score':
        newRefValue = forgeFileRefValueScore(DbSong, file.mimetype);
        modelRefProperty = 'refScore';
        storageFolder = config.storage.scores;
        break;
      case 'tablature':
        newRefValue = forgeFileRefValueTablature(DbSong, file.mimetype);
        modelRefProperty = 'refTablature';
        storageFolder = config.storage.tablatures;
        break;
      default:
        moduleAssets.logger.error({ songId: DbSong.id }, `invalid file type '${fieldname}'`);
        throw new BaseError('not-found', 'file not found', StatusCodes.NOT_IMPLEMENTED);
    }

    // Compute path deletion only if actual value exist and new ref is different
    let pathToDelete: _FileLinkElem['pathToDelete'] = null;
    if (DbSong[modelRefProperty] !== null && DbSong[modelRefProperty] !== newRefValue) {
      pathToDelete = path.join(storageFolder, DbSong[modelRefProperty] as string);
    }

    return {
      modelRefProperty,
      newRefValue,
      pathToDelete,
      newRefFilepath: path.join(storageFolder, newRefValue),
      uploadPath: file.path,
      moveSuccess: undefined,
    };
  });
};

/**
 * @since 1.0.0
 * @todo rollback
 * @todo what if new ref name is the same as the one of another song?
 * @todo status code if any resource is in use
 */
const _moveFiles = async (moduleAssets: ModuleAssets, supportStruct: FileLinkStruct, DbSong: Song): Promise<FileLinkStructAfterMove> => {
  // move files
  const fsmovePromises = supportStruct.map(async (fileDescriptor) => {
    try {
      await fs.move(fileDescriptor.uploadPath, fileDescriptor.newRefFilepath, { overwrite: true });
      fileDescriptor.moveSuccess = true;
    } catch (err) {
      moduleAssets.logger.error(
        { err: err, oldPath: fileDescriptor.uploadPath, newPath: fileDescriptor.newRefFilepath, songId: DbSong.id },
        `FAILED: file '${fileDescriptor.modelRefProperty}' replacement`
      );
      fileDescriptor.moveSuccess = false;
    }

    return fileDescriptor;
  });

  const _supportStructAfterMove = await Promise.all(fsmovePromises);
  const failedMove = _supportStructAfterMove.filter((moveAttempt) => moveAttempt.moveSuccess !== true);
  const successMove = _supportStructAfterMove.filter((moveAttempt) => moveAttempt.moveSuccess === true) as FileLinkStructAfterMove;

  if (failedMove.length) {
    // rollback
    throw new BaseError('TODO', '', StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return successMove;
};

/**
 * Update the target model with the new reference value
 * @since 1.0.0
 * @todo maybe there's a better way to preserve types along the way
 */
const _updateModelRef = async (moduleAssets: ModuleAssets, DbSong: Song, supportStruct: FileLinkStructAfterMove): Promise<Song> => {
  const modelUpdateData = Object.fromEntries(
    supportStruct
      // exclude ref properties which value is left unchanged
      .filter((movedFileRef) => movedFileRef.newRefValue !== DbSong[movedFileRef.modelRefProperty])
      .map((movedFileRef) => {
        return [movedFileRef.modelRefProperty, movedFileRef.newRefValue];
      })
  );

  if (Object.keys(modelUpdateData).length) {
    DbSong = await db.song.update({
      where: {
        id: DbSong.id,
      },
      data: modelUpdateData,
    });
    moduleAssets.logger.debug({ ...modelUpdateData, songId: DbSong.id }, `SUCCESS: model update`);
  } else {
    moduleAssets.logger.debug({ songId: DbSong.id }, `IGNORED: model update`);
  }

  return DbSong;
};

/**
 * @since 1.0.0
 * @todo status code if the resource is in use
 * @todo parameter to replace 'deletion' with 'archive'
 */
const _deleteOldFiles = async (
  moduleAssets: ModuleAssets,
  DbSong: Song,
  supportStruct: FileLinkStructAfterMove
): Promise<FileLinkStructAfterMove> => {
  const fsDeletePromises = supportStruct.map(async (fileDescriptor) => {
    if (fileDescriptor.pathToDelete) {
      try {
        await fs.remove(fileDescriptor.pathToDelete);
      } catch (err) {
        moduleAssets.logger.fatal(
          { err: err, path: fileDescriptor.pathToDelete, songId: DbSong.id },
          `FAILED: old file '${fileDescriptor.modelRefProperty}' delete`
        );
        // no need to propagate the error. We are leaving some trash along the filesystem that will be manually purged
      }
    }
    return fileDescriptor;
  });

  supportStruct = await Promise.all(fsDeletePromises);

  return supportStruct;
};
