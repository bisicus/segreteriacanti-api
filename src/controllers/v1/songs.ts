import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { fetchSongToPublic } from '../../modules/services/song';

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
