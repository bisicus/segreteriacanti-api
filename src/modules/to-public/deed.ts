import type { Deed, Recording } from '@prisma/client';

import logger from '../logger';
import type { RegistrazionePublic } from './recording';
import { recordingToPublic } from './recording';

/**
 * input composto da modello con relazioni per trasformare 'Gesto' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type GestoConRelazioni = Deed &
  Partial<{
    recordings: Recording[];
  }>;

/**
 * interfaccia pubblica per 'Gesto'
 * @since 1.0.0
 */
export type GestoPublic = Deed &
  Partial<{
    recordings: RegistrazionePublic[];
  }>;

/**
 * Trasforma il modello 'Gesto' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const deedToPublic = (deed: GestoConRelazioni): GestoPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { recordings, ..._deed } = deed;
  const deedPublic: GestoPublic = _deed;

  if (Array.isArray(recordings)) {
    deedPublic.recordings = recordings.map((_r) => {
      logger.trace({ id: deed.id, registrazioneId: _r.id }, "toPublic 'gesto': aggiunta 'registrazione'");
      return recordingToPublic(_r);
    });
  }

  return deedPublic;
};
