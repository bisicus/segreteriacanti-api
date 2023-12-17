import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../errors/BaseError';

export const uploadAssets: RequestHandler = async (req, res, next) => {
  try {
    // validation
    if (!req.file) {
      throw new BaseError('validation', 'missing file', StatusCodes.BAD_REQUEST);
    }
    if (!req.params['id']) {
      throw new BaseError('validation', 'missing field', StatusCodes.BAD_REQUEST);
    }
    if (Number.isNaN(Number(req.params['id']))) {
      throw new BaseError('validation', "invalid value for field 'id'", StatusCodes.BAD_REQUEST);
    }

    // TODO: servizio di upload

    res.status(StatusCodes.OK).json({});
  } catch (error) {
    next(error);
  }
};
