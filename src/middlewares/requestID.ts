/**
 * Re-Implementation of 'express-request-id' that does not inteferes with build.
 * Maybe, at some point they will fix it so to avoid re-implementing this method
 * @see {@link https://www.npmjs.com/package/express-request-id}
 */

import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * @since 1.0.0
 */
export type RequestIdOptions = {
  setHeader?: boolean | undefined;
  headerName?: string | undefined;
  generator?: ((request: Request) => string) | undefined;
};

/**
 * @since 1.0.0
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateV4UUID(_request: Request) {
  return uuidv4();
}

/**
 * @since 1.0.0
 */
export default function requestID({ generator = generateV4UUID, headerName = 'X-Request-Id', setHeader = true }: RequestIdOptions = {}) {
  return function (request: Request, response: Response, next: NextFunction) {
    const oldValue = request.get(headerName);
    const requestId = oldValue === undefined ? generator(request) : oldValue;

    if (setHeader) {
      response.set(headerName, requestId);
    }

    request.id = requestId;

    next();
  };
}

///////////////////////////////////
/////   MODULE AUGMENTATION   /////
///////////////////////////////////

declare module 'express-serve-static-core' {
  export interface Request {
    id: string;
  }
}
