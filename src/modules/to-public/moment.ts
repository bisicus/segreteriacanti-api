import type { Moment, Recording } from '@prisma/client';

import logger from '../logger';
import type { RecordingPublic } from './recording';
import { recordingToPublic } from './recording';

/**
 * input composto da modello con relazioni per trasformare 'Momento' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type MomentWithRelated = Moment &
  Partial<{
    recordings: Recording[];
  }>;

/**
 * interfaccia pubblica per 'Momento'
 * @since 1.0.0
 */
export type MomentPublic = Moment &
  Partial<{
    recordings: RecordingPublic[];
  }>;

/**
 * Trasforma il modello 'Momento' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const momentToPublic = (moment: MomentWithRelated): MomentPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { recordings, ..._moment } = moment;
  const momentPublic: MomentPublic = _moment;

  if (Array.isArray(recordings)) {
    momentPublic.recordings = recordings.map((_r) => {
      logger.trace({ id: moment.id, recordingId: _r.id }, "toPublic 'momento': add 'recording'");
      return recordingToPublic(_r);
    });
  }

  return momentPublic;
};
