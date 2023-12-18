import { Router } from 'express';
import multer from 'multer';

import { config } from '../../config';
import { downloadAsset, uploadAssets } from '../../controllers/v1/recordings';

/**
 * @since 1.0.0
 */
const recordingsRouter = Router();

recordingsRouter.get('/:id/audio', downloadAsset);

/**
 * @todo spostare `fileFilter` in file separato
 */
recordingsRouter.post(
  '/:id/assets',
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
