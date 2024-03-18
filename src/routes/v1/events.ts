import { Router } from 'express';
import z from 'zod';

import { getEventObject, listEvents } from '../../controllers/v1/events';
import requestValidation from '../../middlewares/validation';
import { IDValidator } from '../../validators/common';

/**
 * @since 1.0.0
 */
const eventsRouter = Router();

/**
 * @todo add validator for query filters
 */
eventsRouter.get('/', listEvents);

eventsRouter.get(
  '/:id',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  getEventObject
);

export { eventsRouter };
