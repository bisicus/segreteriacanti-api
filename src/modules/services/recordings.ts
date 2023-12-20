import type { Recording } from '@prisma/client';
import fs from 'fs-extra';
import { StatusCodes } from 'http-status-codes';
import { extension } from 'mime-types';
import path from 'path';

import { config } from '../../config';
import { BaseError } from '../../errors/BaseError';
import { db } from '../db';
import logger from '../logger';
import type { RegistrazioneConTitoloCanto } from '../models/recordings';
import { forgeFilename } from '../models/recordings';
import { registrazioneToPublic } from '../to-public/recording';

/**
 * Ritorna l'oggetto che descrive una registrazione. Allega eventualmente le entità relazionate.
 * @since 1.0.0
 */
export const fetchRecordingToPublic = async (recordingId: number) => {
  const DBRegistrazione = await db.recording.findUnique({
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
  if (!DBRegistrazione) {
    throw new BaseError('not-found', 'recording not found', StatusCodes.NOT_FOUND);
  }

  // Interfaccia pubblica
  return registrazioneToPublic(DBRegistrazione);
};

/**
 * @since 1.0.0
 * @todo controllare che il contenuto del file sia un audio
 * @todo dare un nome al file che non `refAudio`
 */
export const getRecordingFile = async (recordingId: number) => {
  const DBRegistrazione = await db.recording.findUnique({
    where: {
      id: recordingId,
    },
  });
  if (!DBRegistrazione) {
    throw new BaseError('not-found', 'recording not found', StatusCodes.NOT_FOUND);
  }

  if (DBRegistrazione.refAudio === null) {
    throw new BaseError('not-found', 'file not found', StatusCodes.NOT_FOUND);
  }
  const filepath = path.join(config.storage.recordings, DBRegistrazione.refAudio);
  if (fs.existsSync(filepath) === false) {
    logger.fatal({ path: filepath, recordingId: recordingId }, 'il file non esiste nel Filesystem');
    throw new BaseError('not-found', 'file not available', StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return { filepath: filepath, filename: DBRegistrazione.refAudio };
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
  logger.debug({ filename: file.filename, mime: file.mimetype, recordId: recordingId }, 'gestione del file per la registrazione');

  const DBRegistrazioneConTitolo: RegistrazioneConTitoloCanto | null = await db.recording.findUnique({
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

  if (!DBRegistrazioneConTitolo) {
    throw new BaseError('not-found', 'file not found', StatusCodes.NOT_FOUND);
  }

  // Componi nome univoco per il file nel FS
  const _fileName = forgeFilename(DBRegistrazioneConTitolo);
  const _fileExtension = extension(file.mimetype);
  const filePath = `${_fileName}.${_fileExtension}`;
  logger.debug({ path: filePath, recordId: recordingId }, 'nuovo path per il file');

  // Muovi il file nella cartella delle registrazioni
  const _destinationPath = path.join(config.storage.recordings, filePath);
  logger.debug({ oldPath: file.path, newPath: _destinationPath, recordId: recordingId }, 'sostituzione file');

  try {
    await fs.move(file.path, _destinationPath, { overwrite: true });
  } catch (err) {
    logger.error({ err: err, oldPath: file.path, newPath: _destinationPath, recordId: recordingId }, 'impossibile sostituire il file');
    throw err;
  }

  // aggiorna il modell
  let registrazioneUpdated: Recording;
  if (filePath !== DBRegistrazioneConTitolo.refAudio) {
    logger.info({ oldRef: DBRegistrazioneConTitolo.refAudio, newRef: filePath, recordId: recordingId }, 'sostituzione di audio ref');

    // trattieni vecchio file
    const oldRef = DBRegistrazioneConTitolo.refAudio;

    // aggiorna modello
    registrazioneUpdated = await db.recording.update({
      where: {
        id: recordingId,
      },
      data: {
        refAudio: filePath,
      },
    });
    logger.debug({ newRef: filePath, recordId: recordingId }, 'audio ref sostituita correttamente');

    // cancella vecchio file
    if (oldRef) {
      const _removePath = path.join(config.storage.recordings, oldRef);
      logger.debug({ path: _removePath, recordId: recordingId }, 'rimozione audio ref');

      try {
        await fs.remove(path.join(config.storage.recordings, oldRef));
      } catch (err) {
        logger.fatal({ err: err, path: _removePath, recordId: recordingId }, 'impossibile rimuovere audio ref');
        // non è necessario interrompere il flusso; accumuliamo solo sporcizia.
      }
    }
  } else {
    // riutilizza il modello preso dal DB
    logger.debug({ ref: DBRegistrazioneConTitolo.refAudio, recordId: recordingId }, 'audio ref non modificata dalla richiesta');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { song: canto, ..._r } = DBRegistrazioneConTitolo;
    registrazioneUpdated = _r;
  }

  return registrazioneUpdated;
};
