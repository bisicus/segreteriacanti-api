import { Router } from 'express';

import { importRouter } from './import';
import { recordsRouter } from './records';

/**
 * @since 1.0.0
 */
const v1Routes = Router();

// load general middlewares for this router
// v1Routes.use(middlewareFunction());

// load nested routers or endpoints
v1Routes.use('/import', importRouter);
v1Routes.use('/records', recordsRouter);

export { v1Routes };
