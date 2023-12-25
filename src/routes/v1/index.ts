import { Router } from 'express';

import moduleAssets from '../../middlewares/moduleAssets';
import { importRouter } from './import';
import { recordingsRouter } from './recordings';

/**
 * @since 1.0.0
 */
const v1Routes = Router();

// load general middlewares for this router
v1Routes.use(moduleAssets());

// load nested routers or endpoints
v1Routes.use('/import', importRouter);
v1Routes.use('/recordings', recordingsRouter);

export { v1Routes };
