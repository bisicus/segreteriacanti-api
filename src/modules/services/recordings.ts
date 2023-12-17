import type { Registrazione } from '@prisma/client';
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

/**
 * Crea una refenza tra un file e una `Registrazione`.
 * Se il modello è già linkato ad un file, sostituisce la referenza eliminando la vecchia registrazione.
 * @since 1.0.0
 * @todo `mp3` viene trasformato in `mpga`
 * @todo se update in DB non funziona elimina il nuovo file
 * @todo implementare un "Cestino delle registrazioni?"
 */
export const linkUploadedFile = async (recordingId: number, file: Express.Multer.File): Promise<Registrazione> => {
  logger.debug({ filename: file.filename, mime: file.mimetype, recordId: recordingId }, 'gestione del file per la registrazione');

  const DBRegistrazioneConTitolo: RegistrazioneConTitoloCanto | null = await db.registrazione.findUnique({
    where: {
      id: recordingId,
    },
    include: {
      canto: {
        select: {
          nome: true,
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
  let registrazioneUpdated: Registrazione;
  if (filePath !== DBRegistrazioneConTitolo.refAudio) {
    logger.info({ oldRef: DBRegistrazioneConTitolo.refAudio, newRef: filePath, recordId: recordingId }, 'sostituzione di audio ref');

    // trattieni vecchio file
    const oldRef = DBRegistrazioneConTitolo.refAudio;

    // aggiorna modello
    registrazioneUpdated = await db.registrazione.update({
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
    const { canto, ..._r } = DBRegistrazioneConTitolo;
    registrazioneUpdated = _r;
  }

  return registrazioneUpdated;
};
