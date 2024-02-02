import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../errors/BaseError';
import {
  fetchSongToPublic,
  getSongFileLyrics,
  getSongFileScore,
  getSongFileTablature,
  linkUploadedFiles,
  listSongsToPublic,
} from '../../modules/services/song';
import { isStringRecord } from '../../modules/utils';

/**
 * @since 1.0.0
 * @todo query param to list filters
 */
export const listSongs: RequestHandler = async (req, res, next) => {
  try {
    const songList = await listSongsToPublic(req.assets);

    res.status(StatusCodes.OK).json(songList);
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
 */
export const getSongObject: RequestHandler = async (req, res, next) => {
  try {
    const song = await fetchSongToPublic(req.assets, Number(req.params.id));

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
    const { filepath, filename } = await getSongFileLyrics(req.assets, Number(req.params.id));

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
    const { filepath, filename } = await getSongFileScore(req.assets, Number(req.params.id));

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
    const { filepath, filename } = await getSongFileTablature(req.assets, Number(req.params.id));

    res.download(filepath, filename); // Set content-disposition and send file.
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
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

    // Update song ref(s)
    const updatedSong = await linkUploadedFiles(req.assets, Number(req.params.id), req.files);

    res.status(StatusCodes.OK).json(updatedSong);
  } catch (error) {
    next(error);
  }
};
