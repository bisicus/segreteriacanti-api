import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';

import { config } from '../../config';
import { downloadSongLyrics, downloadSongScore, downloadSongTablature, getSongObject, uploadAndLinkFiles } from '../../controllers/v1/songs';
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

/**
 * @todo spostare `fileFilter` in file separato
 * @todo sluggify
 */
songsRouter.post(
  '/:id/assets',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  multer({
    storage: multer.diskStorage({
      destination: config.storage.tmp,
    }),
    fileFilter: (_req, file, cb) => {
      // MIME check depending on form field name
      let acceptFile = false;

      if (file.fieldname === 'lyrics') {
        acceptFile = config.application.uploads.acceptedMime.lyrics.includes(file.mimetype);
      } else if (file.fieldname === 'score') {
        acceptFile = config.application.uploads.acceptedMime.scores.includes(file.mimetype);
      } else if (file.fieldname === 'tablature') {
        acceptFile = config.application.uploads.acceptedMime.scores.includes(file.mimetype);
      }

      cb(null, acceptFile);
    },
  }).fields([
    {
      name: 'lyrics',
      maxCount: 1,
    },
    {
      name: 'score',
      maxCount: 1,
    },
    {
      name: 'tablature',
      maxCount: 1,
    },
  ]),
  uploadAndLinkFiles
);

export { songsRouter };
