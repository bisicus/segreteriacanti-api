import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
import { z } from 'zod';

import ValidationError from '../errors/ValidationError';

/**
 * Schema enforcing for request validation. A schema defined like this will account for any of body, path or query parameters
 * @since 1.0.0
 */
export type RequestValidatorSchema = Partial<{
  body: ZodSchema;
  query: ZodSchema;
  params: ZodSchema;
}>;

/**
 * @since 1.0.0
 * @see {@link https://dev.to/franciscomendes10866/schema-validation-with-zod-and-expressjs-111p}
 */
export default function requestValidation(schema: RequestValidatorSchema): RequestHandler {
  return async function (req, _res, next) {
    try {
      // since schema type is enforced without zod at first level there's need to re-create the object
      const validator = z.object(schema);
      await validator.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      // go to default error handler
      return next(new ValidationError(error));
    }
  };
}
