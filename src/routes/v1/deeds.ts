import { Router } from 'express';
import z from 'zod';

import { getDeedObject, listDeeds } from '../../controllers/v1/deeds';
import requestValidation from '../../middlewares/validation';
import { IDValidator } from '../../validators/common';

/**
 * @since 1.0.0
 */
const deedsRouter = Router();

/**
 * @todo add validator for query filters
 */
deedsRouter.get('/', listDeeds);

deedsRouter.get(
  '/:id',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  getDeedObject
);

export { deedsRouter };
