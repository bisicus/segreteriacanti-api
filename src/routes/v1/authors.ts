import { Router } from 'express';
import z from 'zod';

import { getAuthorObject, listAuthors } from '../../controllers/v1/authors';
import requestValidation from '../../middlewares/validation';
import { IDValidator } from '../../validators/common';

/**
 * @since 1.0.0
 */
const authorsRouter = Router();

/**
 * @todo add validator for query filters
 */
authorsRouter.get('/', listAuthors);

authorsRouter.get(
  '/:id',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  getAuthorObject
);

export { authorsRouter };
