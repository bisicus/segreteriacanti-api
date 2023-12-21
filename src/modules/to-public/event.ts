import type { Event, Recording } from '@prisma/client';

import logger from '../logger';
import type { RecordingPublic } from './recording';
import { recordingToPublic } from './recording';

/**
 * input composto da modello con relazioni per trasformare 'Evento' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type EventWithRelated = Event &
  Partial<{
    recordings: Recording[];
  }>;

/**
 * interfaccia pubblica per 'Evento'
 * @since 1.0.0
 */
export type EventPublic = Event &
  Partial<{
    recordings: RecordingPublic[];
  }>;

/**
 * Trasforma il modello 'Evento' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const eventToPublic = (event: EventWithRelated): EventPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { recordings, ..._event } = event;
  const eventPublic: EventPublic = _event;

  if (Array.isArray(recordings)) {
    eventPublic.recordings = recordings.map((_r) => {
      logger.trace({ id: event.id, recordingId: _r.id }, "toPublic 'event': add 'recording'");
      return recordingToPublic(_r);
    });
  }

  return eventPublic;
};
