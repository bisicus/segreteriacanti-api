import type { Registrazione } from '@prisma/client';
import fs from 'fs-extra';
import { StatusCodes } from 'http-status-codes';
import { extension } from 'mime-types';
import path from 'path';

import { config } from '../../config';
import { BaseError } from '../../errors/BaseError';
import { db } from '../db';
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
export const linkUploadedFile = async (recordId: number, file: Express.Multer.File): Promise<Registrazione> => {
  const DBRegistrazioneConTitolo: RegistrazioneConTitoloCanto | null = await db.registrazione.findUnique({
    where: {
      id: recordId,
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

  // Muovi il file nella cartella delle registrazioni
  await fs.move(file.path, path.join(config.storage.recordings, filePath), {
    overwrite: true,
  });

  // aggiorna il modell
  let registrazioneUpdated: Registrazione;
  if (filePath !== DBRegistrazioneConTitolo.refAudio) {
    // trattieni vecchio file
    const oldRef = DBRegistrazioneConTitolo.refAudio;

    // aggiorna modello
    registrazioneUpdated = await db.registrazione.update({
      where: {
        id: recordId,
      },
      data: {
        refAudio: filePath,
      },
    });

    // cancella vecchio file
    if (oldRef) {
      await fs.remove(path.join(config.storage.recordings, oldRef));
    }
  } else {
    // riutilizza il modello preso dal DB
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { canto, ..._r } = DBRegistrazioneConTitolo;
    registrazioneUpdated = _r;
  }

  return registrazioneUpdated;
};
