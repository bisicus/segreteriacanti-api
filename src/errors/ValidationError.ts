import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

import { BaseError } from './BaseError';

const DEFAULT_ERROR_NAME = 'validation-error';
const DEFAULT_ERROR_MESSAGE = 'validation error';

/**
 * wrap an error in validating an object.
 * Support custom:
 * - ZodError
 * @since 1.0.0
 * @see ZodError
 */
class ValidationError extends BaseError {
  constructor(validationError: object) {
    if (validationError instanceof ZodError) {
      super(DEFAULT_ERROR_NAME, validationError.message, StatusCodes.BAD_REQUEST, validationError.errors);
    } else if (validationError instanceof Error) {
      super(DEFAULT_ERROR_NAME, validationError.message, StatusCodes.BAD_REQUEST);
    } else {
      super(DEFAULT_ERROR_NAME, DEFAULT_ERROR_MESSAGE, StatusCodes.BAD_REQUEST);
    }
  }
}

export default ValidationError;
