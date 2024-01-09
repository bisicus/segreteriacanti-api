import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../errors/BaseError';
import { fetchSongToPublic, getSongFileLyrics, getSongFileScore, getSongFileTablature } from '../../modules/services/song';
import { isStringRecord } from '../../modules/utils';

/**
 * @since 1.0.0
 */
export const getSongObject: RequestHandler = async (req, res, next) => {
  try {
    const song = await fetchSongToPublic(req.assets, Number(req.params['id']));

    res.status(StatusCodes.OK).json(song);
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
 */
export const downloadSongLyrics: RequestHandler = async (req, res, next) => {
  try {
    const { filepath, filename } = await getSongFileLyrics(req.assets, Number(req.params['id']));

    res.download(filepath, filename); // Set content-disposition and send file.
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
 */
export const downloadSongScore: RequestHandler = async (req, res, next) => {
  try {
    const { filepath, filename } = await getSongFileScore(req.assets, Number(req.params['id']));

    res.download(filepath, filename); // Set content-disposition and send file.
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
 */
export const downloadSongTablature: RequestHandler = async (req, res, next) => {
  try {
    const { filepath, filename } = await getSongFileTablature(req.assets, Number(req.params['id']));

    res.download(filepath, filename); // Set content-disposition and send file.
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
 * @todo implement link method
 * @todo move validation in separate method
 */
export const uploadAndLinkFiles: RequestHandler = async (req, res, next) => {
  try {
    // VALIDATION
    if (!req.files) {
      throw new BaseError('validation', 'missing files', StatusCodes.BAD_REQUEST);
    }
    // files should be stored in a string-indexed `Record`
    if (isStringRecord(req.files) === false) {
      throw new BaseError('validation', 'invalid files', StatusCodes.BAD_REQUEST);
    }

    const maybeMultipleFiles = Object.entries(req.files)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_filename, files]) => files.length > 1)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([_filename, _files]) => _filename);
    if (maybeMultipleFiles.length) {
      throw new BaseError('validation', `invalid file properties ${maybeMultipleFiles.join(', ')}`, StatusCodes.BAD_REQUEST);
    }

    /** object with a single file per property */
    const parsedFiles = Object.fromEntries(
      Object.entries(req.files).flatMap(([filename, files]) => {
        // remove properties with no files
        return files.length ? [[filename, files[0] as Express.Multer.File]] : [];
      })
    );

    if (Object.keys(parsedFiles).length === 0) {
      throw new BaseError('validation', 'missing files', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json('TODO');
  } catch (error) {
    next(error);
  }
};
