import { Router } from 'express';
import z from 'zod';

import { getMomentObject, listMoments } from '../../controllers/v1/moments';
import requestValidation from '../../middlewares/validation';
import { IDValidator } from '../../validators/common';

/**
 * @since 1.0.0
 */
const momentsRouter = Router();

/**
 * @todo add validator for query filters
 */
momentsRouter.get('/', listMoments);

momentsRouter.get(
  '/:id',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  getMomentObject
);

export { momentsRouter };
