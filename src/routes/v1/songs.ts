import { Router } from 'express';
import { z } from 'zod';

import { getSongObject } from '../../controllers/v1/songs';
import requestValidation from '../../middlewares/validation';
import { IDValidator } from '../../validators/common';

/**
 * @since 1.0.0
 */
const songsRouter = Router();

songsRouter.get(
  '/:id',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  getSongObject
);

export { songsRouter };
