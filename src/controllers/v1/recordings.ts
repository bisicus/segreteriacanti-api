import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../errors/BaseError';
import { fetchRecordingToPublic, getRecordingFile, linkUploadedFile } from '../../modules/services/recording';

/**
 * @since 1.0.0
 */
export const getRecordingObject: RequestHandler = async (req, res, next) => {
  try {
    const recording = await fetchRecordingToPublic(req.assets, Number(req.params.id));

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
    const { filepath, filename } = await getRecordingFile(req.assets, Number(req.params.id));

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

    const registrazioneUpdated = await linkUploadedFile(req.assets, Number(req.params.id), req.file);

    res.status(StatusCodes.OK).json(registrazioneUpdated);
  } catch (error) {
    next(error);
  }
};
