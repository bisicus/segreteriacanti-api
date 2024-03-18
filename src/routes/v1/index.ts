import { Router } from 'express';

import moduleAssets from '../../middlewares/moduleAssets';
import { authorsRouter } from './authors';
import { eventsRouter } from './events';
import { importRouter } from './import';
import { momentsRouter } from './moments';
import { recordingsRouter } from './recordings';
import { songsRouter } from './songs';
import { translationsRouter } from './translations';

/**
 * @since 1.0.0
 */
const v1Routes = Router();

// load general middlewares for this router
v1Routes.use(moduleAssets());

// load nested routers or endpoints
v1Routes.use('/authors', authorsRouter);
v1Routes.use('/events', eventsRouter);
v1Routes.use('/import', importRouter);
v1Routes.use('/moments', momentsRouter);
v1Routes.use('/recordings', recordingsRouter);
v1Routes.use('/songs', songsRouter);
v1Routes.use('/translations', translationsRouter);

export { v1Routes };
