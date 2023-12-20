import type { Recording } from '@prisma/client';
import fs from 'fs-extra';
import { StatusCodes } from 'http-status-codes';
import { extension } from 'mime-types';
import path from 'path';

import { config } from '../../config';
import { BaseError } from '../../errors/BaseError';
import { db } from '../db';
import logger from '../logger';
import type { RegistrazioneConTitoloCanto } from '../models/recording';
import { forgeFilename } from '../models/recording';
import { recordingToPublic } from '../to-public/recording';

/**
 * Ritorna l'oggetto che descrive una registrazione. Allega eventualmente le entità relazionate.
 * @since 1.0.0
 */
export const fetchRecordingToPublic = async (recordingId: number) => {
  const DbRecording = await db.recording.findUnique({
    where: {
      id: recordingId,
    },
    include: {
      deed: true,
      event: true,
      moment: true,
      song: true,
    },
  });
  if (!DbRecording) {
    throw new BaseError('not-found', 'recording not found', StatusCodes.NOT_FOUND);
  }

  // Interfaccia pubblica
  return recordingToPublic(DbRecording);
};

/**
 * @since 1.0.0
 * @todo controllare che il contenuto del file sia un audio
 * @todo dare un nome al file che non `refAudio`
 */
export const getRecordingFile = async (recordingId: number) => {
  const DbRecording = await db.recording.findUnique({
    where: {
      id: recordingId,
    },
  });
  if (!DbRecording) {
    throw new BaseError('not-found', 'recording not found', StatusCodes.NOT_FOUND);
  }

  if (DbRecording.refAudio === null) {
    throw new BaseError('not-found', 'file not found', StatusCodes.NOT_FOUND);
  }
  const filepath = path.join(config.storage.recordings, DbRecording.refAudio);
  if (fs.existsSync(filepath) === false) {
    logger.fatal({ path: filepath, recordingId: recordingId }, 'non-existent file');
    throw new BaseError('not-found', 'file not available', StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return { filepath: filepath, filename: DbRecording.refAudio };
};

/**
 * Crea una refenza tra un file e una `Registrazione`.
 * Se il modello è già linkato ad un file, sostituisce la referenza eliminando la vecchia registrazione.
 * @since 1.0.0
 * @todo `mp3` viene trasformato in `mpga`
 * @todo se update in DB non funziona elimina il nuovo file
 * @todo implementare un "Cestino delle registrazioni?"
 */
export const linkUploadedFile = async (recordingId: number, file: Express.Multer.File): Promise<Recording> => {
  logger.debug({ filename: file.filename, mime: file.mimetype, recordId: recordingId }, 'handling file for recording');

  const DbRecordingWithRelated: RegistrazioneConTitoloCanto | null = await db.recording.findUnique({
    where: {
      id: recordingId,
    },
    include: {
      song: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!DbRecordingWithRelated) {
    throw new BaseError('not-found', 'file not found', StatusCodes.NOT_FOUND);
  }

  // Componi nome univoco per il file nel FS
  const _fileName = forgeFilename(DbRecordingWithRelated);
  const _fileExtension = extension(file.mimetype);
  const filePath = `${_fileName}.${_fileExtension}`;
  logger.debug({ path: filePath, recordId: recordingId }, 'new filepath');

  // Muovi il file nella cartella delle registrazioni
  const _destinationPath = path.join(config.storage.recordings, filePath);
  logger.debug({ oldPath: file.path, newPath: _destinationPath, recordId: recordingId }, 'file replacement');

  try {
    await fs.move(file.path, _destinationPath, { overwrite: true });
  } catch (err) {
    logger.error({ err: err, oldPath: file.path, newPath: _destinationPath, recordId: recordingId }, 'FAILED: file replacement');
    throw err;
  }

  // aggiorna il modell
  let recordingUpdated: Recording;
  if (filePath !== DbRecordingWithRelated.refAudio) {
    logger.info({ oldRef: DbRecordingWithRelated.refAudio, newRef: filePath, recordId: recordingId }, 'replacing audio ref');

    // trattieni vecchio file
    const oldRef = DbRecordingWithRelated.refAudio;

    // aggiorna modello
    recordingUpdated = await db.recording.update({
      where: {
        id: recordingId,
      },
      data: {
        refAudio: filePath,
      },
    });
    logger.debug({ newRef: filePath, recordId: recordingId }, 'SUCCESS: replace audio ref');

    // cancella vecchio file
    if (oldRef) {
      const _removePath = path.join(config.storage.recordings, oldRef);
      logger.debug({ path: _removePath, recordId: recordingId }, 'remove old audio ref');

      try {
        await fs.remove(path.join(config.storage.recordings, oldRef));
      } catch (err) {
        logger.fatal({ err: err, path: _removePath, recordId: recordingId }, 'FAILED: remove old audio ref');
        // non è necessario interrompere il flusso; accumuliamo solo sporcizia.
      }
    }
  } else {
    // riutilizza il modello preso dal DB
    logger.debug({ ref: DbRecordingWithRelated.refAudio, recordId: recordingId }, 'audio ref left untouched');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { song, ..._r } = DbRecordingWithRelated;
    recordingUpdated = _r;
  }

  return recordingUpdated;
};
