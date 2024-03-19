import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { fetchAuthorToPublic, listAuthorsToPublic } from '../../modules/services/author';

/**
 * @since 1.0.0
 */
export const getAuthorObject: RequestHandler = async (req, res, next) => {
  try {
    const authors = await fetchAuthorToPublic(req.assets, Number(req.params.id));

    res.status(StatusCodes.OK).json(authors);
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
 * @todo query param to order
 * @todo query param to pagination
 */
export const listAuthors: RequestHandler = async (req, res, next) => {
  try {
    const authorsList = await listAuthorsToPublic(req.assets, req.query as Record<string, string | string[]>);

    res.status(StatusCodes.OK).json(authorsList);
  } catch (error) {
    next(error);
  }
};
