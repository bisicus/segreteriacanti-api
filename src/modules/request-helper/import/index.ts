import csvtojson from 'csvtojson';
import { StatusCodes } from 'http-status-codes';

import { config } from '../../../config';
import { BaseError } from '../../../errors/BaseError';
import logger from '../../logger';

///////////////////////
/////   OPTIONS   /////
///////////////////////

/**
 * @since 1.0.0
 */
export type OptionsCsvToJson = Partial<{
  arraySeparator: string;
}>;

/**
 * @since 1.0.0
 */
const _optionDefaultCsv: Required<OptionsCsvToJson> = {
  arraySeparator: config.application.import.csv.arraySeparator,
};

/**
 * Morph input csv to an array of import rows.
 * Csv cells are supposed to be separated using using either _comma_ (`','`) or _semi_ (`';'`)
 * after parsing, columns are scanned seeking for arrays. default separator is _double dot_ (`'..'`)
 * Csv can be input either by `Multer.File`, directly from request or by path.
 *
 * Notes
 * -----
 * Multer is supported to exploit `file.buffer` as it's already in memory. This avoid expensive I/O operations.
 * @since 1.0.0
 * @todo replace `logger` with 'requestLogger' using `moduleAssets`
 * @todo replace BaseError with more specific error
 * @todo library allows for nested using _dot_ to create nested objects
 */
export async function requestCsvToImportJson(csvFile: Express.Multer.File | string, options?: OptionsCsvToJson) {
  try {
    // load options
    const _options = { ..._optionDefaultCsv, ...options };

    /**
     * @since 1.0.0
     */
    const CSV_PARSER = csvtojson({
      delimiter: config.application.import.csv.delimiters,
      output: 'json',
      nullObject: true,
    });

    let parsedCsv;
    if (typeof csvFile === 'string') {
      parsedCsv = await CSV_PARSER.fromFile(csvFile);
    } else if (csvFile) {
      parsedCsv = await CSV_PARSER.fromString(csvFile.buffer.toString());
    } else {
      throw new BaseError('inputError', 'missing CSV', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    parsedCsv = parsedCsv.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          if (typeof value === 'string') {
            const _arrayedValue: string[] = value.split(_options.arraySeparator);
            if (_arrayedValue.length > 1) {
              value = _arrayedValue;
            }
          }
          return [key, value];
        })
      );
    });

    return parsedCsv;
  } catch (err) {
    logger.error(err);
    throw new BaseError('conversionError', 'error in CSV parsing', StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
