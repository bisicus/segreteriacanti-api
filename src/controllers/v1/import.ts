import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../errors/BaseError';

/**
 * Data injestion of several entities.
 * Input is an object array; each array element has the same structure.
 * @since 1.0.0
 * @todo return created models
 * @todo validation of every element of the array (evaluate `express-validator` or `zod`)
 * @todo support CSV import
 * @todo support XLSX import
 * @todo localization
 * @todo replace BaseError with more specific error
 */
export const importData: RequestHandler = async (req, res, next) => {
  try {
    if (Array.isArray(req.body) === false) {
      throw new BaseError('validation', 'invalid input', StatusCodes.BAD_REQUEST);
    }

    // TODO: include service that creates data

    res.status(StatusCodes.OK).json({
      message: 'resources created',
    });
  } catch (error) {
    next(error);
  }
};
