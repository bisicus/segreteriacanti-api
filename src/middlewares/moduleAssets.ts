import type { RequestHandler } from 'express';

import type { Logger } from '../modules/logger';
import logger from '../modules/logger';

/**
 * @since 1.0.0
 */
export type ModuleAssets = {
  logger: Logger;
  requestId: string;
  sessionId: number | null;
};

/**
 * @since 1.0.0
 */
export const defaultsModuleAssets: ModuleAssets = {
  logger: logger,
  requestId: '',
  sessionId: null,
};

/**
 * Gathers in a unique structure all the objects built for the request
 * @since 1.0.0
 * @todo add sessionId
 */
export default function moduleAssets(): RequestHandler {
  return function (req, _res, next) {
    const assets: ModuleAssets = {
      ...defaultsModuleAssets,
      ...{
        logger: req.logger,
        requestId: req.id,
        sessionId: -1,
      },
    };

    req.assets = assets;
    return next();
  };
}

///////////////////////////////////
/////   MODULE AUGMENTATION   /////
///////////////////////////////////

declare module 'express-serve-static-core' {
  export interface Request {
    assets: ModuleAssets;
  }
}
