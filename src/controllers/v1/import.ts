import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../errors/BaseError';
import { requestCsvToImportJson } from '../../modules/request-helper/import';
import { importRecords } from '../../modules/services/import';
import { validate } from '../../modules/validate';
import { schemaRecordImportList } from '../../validators';

/**
 * Data injestion of several entities.
 * Input is an object array; each array element has the same structure.
 * @since 1.0.0
 * @todo support XLSX import
 * @todo localization
 * @todo replace BaseError with more specific error
 */
export const importData: RequestHandler = async (req, res, next) => {
  try {
    let importObject;
    if (Object.keys(req.body).length !== 0) {
      importObject = req.body;
    } else if (req.file) {
      importObject = await requestCsvToImportJson(req.assets, req.file);
    } else {
      throw new BaseError('validation', 'missing input', StatusCodes.BAD_REQUEST);
    }

    // validation
    const validated = validate(req.assets, importObject, schemaRecordImportList);

    const newRecordings = await importRecords(req.assets, validated);

    res.status(StatusCodes.CREATED).json(newRecordings);
  } catch (error) {
    next(error);
  }
};
