import type { NextFunction, Request, Response } from 'express';

import type { ChildLoggerBinding } from '../modules/logger';
import logger from '../modules/logger';

export type RequestLoggerOptions = {
  includeRequestId?: boolean;
  includeEndpoint?: boolean;
};

const DEFAULT_OPTIONS: RequestLoggerOptions = {
  includeRequestId: true,
  includeEndpoint: true,
};

/**
 * Spawn a logger for the specific request. Logger is associated to the request ID.
 * @since 1.0.0
 */
export default function requestLogger(options: RequestLoggerOptions = {}) {
  return function (req: Request, _res: Response, next: NextFunction) {
    options = { ...DEFAULT_OPTIONS, ...options };

    const ChildLoggerBindings: ChildLoggerBinding = {};
    if (options.includeRequestId) {
      ChildLoggerBindings['requestId'] = req.id;
    }
    if (options.includeEndpoint) {
      ChildLoggerBindings['endpoint'] = req.path;
      ChildLoggerBindings['method'] = req.method;
    }

    req.logger = logger.child(ChildLoggerBindings);
    next();
  };
}

///////////////////////////////////
/////   MODULE AUGMENTATION   /////
///////////////////////////////////

declare module 'express-serve-static-core' {
  export interface Request {
    logger: typeof logger;
  }
}
