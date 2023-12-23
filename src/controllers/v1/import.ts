import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../errors/BaseError';
import { requestCsvToImportJson } from '../../modules/request-helper/import';
import { importRecords } from '../../modules/services/import';

/**
 * Data injestion of several entities.
 * Input is an object array; each array element has the same structure.
 * @since 1.0.0
 * @todo validation of every element of the array (evaluate `express-validator` or `zod`)
 * @todo support XLSX import
 * @todo localization
 * @todo replace BaseError with more specific error
 */
export const importData: RequestHandler = async (req, res, next) => {
  try {
    let importObject;
    if (Object.keys(req.body).length) {
      if (Array.isArray(req.body) === false) {
        throw new BaseError('validation', 'invalid input', StatusCodes.BAD_REQUEST);
      }
      importObject = req.body;
    } else if (req.file) {
      importObject = await requestCsvToImportJson(req.file);
    } else {
      throw new BaseError('validation', 'missing input', StatusCodes.BAD_REQUEST);
    }

    const newRecordings = await importRecords(importObject);

    res.status(StatusCodes.CREATED).json(newRecordings);
  } catch (error) {
    next(error);
  }
};
