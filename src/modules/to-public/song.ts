import type { Author, Recording, Song } from '@prisma/client';

import logger from '../logger';
import type { AutorePublic } from './author';
import { autoreToPublic } from './author';
import type { RegistrazionePublic } from './recording';
import { registrazioneToPublic } from './recording';

/**
 * input composto da modello con relazioni per trasformare 'Canto' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type CantoConRelazioni = Song &
  Partial<{
    authors: Author[];
    recordings: Recording[];
  }>;

/**
 * interfaccia pubblica per 'Canto'
 * @since 1.0.0
 */
export type CantoPublic = Song &
  Partial<{
    autori: AutorePublic[];
    registrazioni: RegistrazionePublic[];
  }>;

/**
 * Trasforma il modello 'Canto' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const cantoToPublic = (canto: CantoConRelazioni): CantoPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { authors: authors, recordings: recordings, ..._canto } = canto;
  const cantoPublic: CantoPublic = _canto;

  if (Array.isArray(authors)) {
    cantoPublic.autori = authors.map((_a) => {
      logger.trace({ id: canto.id, autoreId: _a.id }, "toPublic 'canto': aggiunta 'autore'");
      return autoreToPublic(_a);
    });
  }
  if (Array.isArray(recordings)) {
    cantoPublic.registrazioni = recordings.map((_r) => {
      logger.trace({ id: canto.id, registrazioneId: _r.id }, "toPublic 'canto': aggiunta 'registrazione'");
      return registrazioneToPublic(_r);
    });
  }

  return cantoPublic;
};
