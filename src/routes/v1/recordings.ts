import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';

import { config } from '../../config';
import { downloadAsset, getRecordingObject, listRecordings, uploadAssets } from '../../controllers/v1/recordings';
import requestValidation from '../../middlewares/validation';
import { IDValidator } from '../../validators/common';

/**
 * @since 1.0.0
 */
const recordingsRouter = Router();

/**
 * @todo add validator for query filters
 */
recordingsRouter.get('/', listRecordings);

recordingsRouter.get(
  '/:id',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  getRecordingObject
);

recordingsRouter.get(
  '/:id/audio',
  requestValidation({
    params: z.object({
      id: IDValidator(),
    }),
  }),
  downloadAsset
);

/**
 * @todo spostare `fileFilter` in file separato
 */
recordingsRouter.post(
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
      // MIME check: deve esssere un audio
      if (config.application.uploads.acceptedMime.audio.includes(file.mimetype)) {
        cb(null, true); // accept file
      } else {
        cb(null, false); // reject file
      }
    },
  }).single('audio'),
  uploadAssets
);

export { recordingsRouter };
