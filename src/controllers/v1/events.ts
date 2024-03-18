import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { fetchEventToPublic, listEventsToPublic } from '../../modules/services/events';

/**
 * @since 1.0.0
 */
export const getEventObject: RequestHandler = async (req, res, next) => {
  try {
    const events = await fetchEventToPublic(req.assets, Number(req.params.id));

    res.status(StatusCodes.OK).json(events);
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
 * @todo query param to list filters
 */
export const listEvents: RequestHandler = async (req, res, next) => {
  try {
    const eventsList = await listEventsToPublic(req.assets);

    res.status(StatusCodes.OK).json(eventsList);
  } catch (error) {
    next(error);
  }
};
