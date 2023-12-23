import { Router } from 'express';
import multer from 'multer';

import { config } from '../../config';
import { importData } from '../../controllers/v1/import';

/**
 * @since 1.0.0
 */
const importRouter = Router();

importRouter.post(
  '/',
  // allow multipart/form-data containing file
  multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, cb) => {
      // MIME check
      if (config.application.uploads.acceptedMime.import.includes(file.mimetype)) {
        cb(null, true); // accept file
      } else {
        cb(null, false); // reject file
      }
    },
  }).single('import'),
  importData
);

export { importRouter };
