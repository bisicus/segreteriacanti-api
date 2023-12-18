import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../errors/BaseError';
import { fetchRecordingToPublic, getRecordingFile, linkUploadedFile } from '../../modules/services/recordings';

/**
 * @since 1.0.0
 * @todo spostare validazione in middleware precedente (valutare `express-validator` o `zod`)
 */
export const getRecordingObject: RequestHandler = async (req, res, next) => {
  try {
    if (!req.params['id']) {
      throw new BaseError('validation', 'missing field', StatusCodes.BAD_REQUEST);
    }
    if (Number.isNaN(Number(req.params['id']))) {
      throw new BaseError('validation', "invalid value for field 'id'", StatusCodes.BAD_REQUEST);
    }

    const recording = await fetchRecordingToPublic(Number(req.params['id']));

    res.status(StatusCodes.OK).json(recording);
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
 */
export const downloadAsset: RequestHandler = async (req, res, next) => {
  try {
    if (!req.params['id']) {
      throw new BaseError('validation', 'missing field', StatusCodes.BAD_REQUEST);
    }
    if (Number.isNaN(Number(req.params['id']))) {
      throw new BaseError('validation', "invalid value for field 'id'", StatusCodes.BAD_REQUEST);
    }

    const { filepath, filename } = await getRecordingFile(Number(req.params['id']));

    res.download(filepath, filename); // Set content-disposition and send file.
  } catch (error) {
    next(error);
  }
};

/**
 * @since 1.0.0
 */
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

    const registrazioneUpdated = await linkUploadedFile(Number(req.params['id']), req.file);

    res.status(StatusCodes.OK).json(registrazioneUpdated);
  } catch (error) {
    next(error);
  }
};
