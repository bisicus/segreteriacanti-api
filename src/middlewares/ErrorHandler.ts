import type { NextFunction, Request, Response } from 'express';

import { BaseError } from '../errors/BaseError';
import logger from '../modules/logger';

/**
 * @see {@link https://reflectoring.io/express-error-handling/}
 * @since 1.0.0
 * @todo create type for `details`
 * @todo logger
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: Error, req: Request, res: Response, _next: NextFunction) => {
  const _logger =
    req.logger ??
    logger.child({
      requestId: req.id,
      endpoint: req.path,
      method: req.method,
    });
  _logger.error(error);

  let status = 500; //default value
  const message = error.message;
  const details: object | null = null;

  if (error instanceof BaseError) {
    status = error.statusCode;
  }
  res.status(status).json({
    message: message,
    details: details,
  });
};
