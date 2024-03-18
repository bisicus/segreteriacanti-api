import { Router } from 'express';
import z from 'zod';

import { getTranslationObject, listTranslations } from '../../controllers/v1/translations';
import requestValidation from '../../middlewares/validation';
import { IDValidator } from '../../validators/common';

/**
 * @since 1.0.0
 */
const translationsRouter = Router();

/**
 * @todo add validator for query filters
 */
translationsRouter.get('/', listTranslations);

translationsRouter.get(
  '/:id',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  getTranslationObject
);

export { translationsRouter };
