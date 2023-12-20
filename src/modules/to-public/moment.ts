import type { Moment, Recording } from '@prisma/client';

import logger from '../logger';
import type { RegistrazionePublic } from './recording';
import { recordingToPublic } from './recording';

/**
 * input composto da modello con relazioni per trasformare 'Momento' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type MomentoConRelazioni = Moment &
  Partial<{
    recordings: Recording[];
  }>;

/**
 * interfaccia pubblica per 'Momento'
 * @since 1.0.0
 */
export type MomentoPublic = Moment &
  Partial<{
    recordings: RegistrazionePublic[];
  }>;

/**
 * Trasforma il modello 'Momento' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const momentToPublic = (moment: MomentoConRelazioni): MomentoPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { recordings, ..._moment } = moment;
  const momentPublic: MomentoPublic = _moment;

  if (Array.isArray(recordings)) {
    momentPublic.recordings = recordings.map((_r) => {
      logger.trace({ id: moment.id, registrazioneId: _r.id }, "toPublic 'momento': aggiunta 'registrazione'");
      return recordingToPublic(_r);
    });
  }

  return momentPublic;
};
