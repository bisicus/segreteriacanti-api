import { Router } from 'express';

import { importData } from '../../controllers/v1/import';

/**
 * @since 1.0.0
 */
const importRouter = Router();

importRouter.post('/', importData);

export { importRouter };
