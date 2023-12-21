import type { Deed, Recording } from '@prisma/client';

import logger from '../logger';
import type { RecordingPublic } from './recording';
import { recordingToPublic } from './recording';

/**
 * input composto da modello con relazioni per trasformare 'Gesto' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type DeedConRelazioni = Deed &
  Partial<{
    recordings: Recording[];
  }>;

/**
 * interfaccia pubblica per 'Gesto'
 * @since 1.0.0
 */
export type DeedPublic = Deed &
  Partial<{
    recordings: RecordingPublic[];
  }>;

/**
 * Trasforma il modello 'Gesto' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const deedToPublic = (deed: DeedConRelazioni): DeedPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { recordings, ..._deed } = deed;
  const deedPublic: DeedPublic = _deed;

  if (Array.isArray(recordings)) {
    deedPublic.recordings = recordings.map((_r) => {
      logger.trace({ id: deed.id, recording: _r.id }, "toPublic 'deed': add 'recording'");
      return recordingToPublic(_r);
    });
  }

  return deedPublic;
};
