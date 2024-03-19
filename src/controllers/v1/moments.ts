import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { fetchMomentToPublic, listMomentsToPublic } from '../../modules/services/moments';

/**
 * @since 1.0.0
 */
export const getMomentObject: RequestHandler = async (req, res, next) => {
  try {
    const moments = await fetchMomentToPublic(req.assets, Number(req.params.id));

    res.status(StatusCodes.OK).json(moments);
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
 * @todo query param to order
 * @todo query param to pagination
 */
export const listMoments: RequestHandler = async (req, res, next) => {
  try {
    const momentsList = await listMomentsToPublic(req.assets, req.query as Record<string, string | string[]>);

    res.status(StatusCodes.OK).json(momentsList);
  } catch (error) {
    next(error);
  }
};
