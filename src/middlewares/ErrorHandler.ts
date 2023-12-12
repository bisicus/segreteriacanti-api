/* eslint-disable no-console */
import type { NextFunction, Request, Response } from 'express';

import { BaseError } from '../errors/BaseError';

/**
 * @see {@link https://reflectoring.io/express-error-handling/}
 * @since 1.0.0
 * @todo create type for `details`
 * @todo logger
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);

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
