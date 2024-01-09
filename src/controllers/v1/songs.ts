import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { fetchSongToPublic, getSongFileLyrics, getSongFileScore, getSongFileTablature } from '../../modules/services/song';

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
 */
export const uploadAndLinkFiles: RequestHandler = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json('TODO');
  } catch (error) {
    next(error);
  }
};
