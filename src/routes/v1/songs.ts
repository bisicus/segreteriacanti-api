import { Router } from 'express';
import { z } from 'zod';

import { downloadSongLyrics, downloadSongScore, downloadSongTablature, getSongObject } from '../../controllers/v1/songs';
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

songsRouter.get(
  '/:id/lyrics',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  downloadSongLyrics
);

songsRouter.get(
  '/:id/score',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  downloadSongScore
);

songsRouter.get(
  '/:id/tablatures',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  downloadSongTablature
);
export { songsRouter };
