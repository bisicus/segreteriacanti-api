import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { fetchDeedToPublic, listDeedsToPublic } from '../../modules/services/deeds';

/**
 * @since 1.0.0
 */
export const getDeedObject: RequestHandler = async (req, res, next) => {
  try {
    const deeds = await fetchDeedToPublic(req.assets, Number(req.params.id));

    res.status(StatusCodes.OK).json(deeds);
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
 * @todo query param to list filters
 */
export const listDeeds: RequestHandler = async (req, res, next) => {
  try {
    const deedsList = await listDeedsToPublic(req.assets);

    res.status(StatusCodes.OK).json(deedsList);
  } catch (error) {
    next(error);
  }
};
