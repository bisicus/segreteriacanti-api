import { Router } from 'express';

/**
 * @since 1.0.0
 */
const v1Routes = Router();

// load general middlewares for this router
// v1Routes.use(middlewareFunction());

// load nested routers or endpoints
// v1Routes.use('/nestedRouter', nesterRouter);

export { v1Routes };
