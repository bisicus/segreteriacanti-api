import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { fetchTranslationToPublic, listTranslationsToPublic } from '../../modules/services/translations';

/**
 * @since 1.0.0
 */
export const getTranslationObject: RequestHandler = async (req, res, next) => {
  try {
    const authors = await fetchTranslationToPublic(req.assets, Number(req.params.id));

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
export const listTranslations: RequestHandler = async (req, res, next) => {
  try {
    const translationsList = await listTranslationsToPublic(req.assets, req.query as Record<string, string | string[]>);

    res.status(StatusCodes.OK).json(translationsList);
  } catch (error) {
    next(error);
  }
};
