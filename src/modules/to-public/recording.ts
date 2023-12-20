import type { Deed, Event, Moment, Recording, Song } from '@prisma/client';

import logger from '../logger';
import type { GestoPublic } from './deed';
import { deedToPublic } from './deed';
import type { EventoPublic } from './event';
import { eventToPublic } from './event';
import type { MomentoPublic } from './moment';
import { momentToPublic } from './moment';
import type { CantoPublic } from './song';
import { songToPublic } from './song';

/**
 * input composto da modello con relazioni per trasformare 'Registrazione' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type RegistrazioneConRelazioni = Recording &
  Partial<{
    deed: Deed | null;
    event: Event | null;
    moment: Moment | null;
    song: Song | null;
  }>;

/**
 * interfaccia pubblica per 'Registrazione'
 * @since 1.0.0
 */
export type RegistrazionePublic = Omit<Recording, 'deed_id' | 'event_id' | 'moment_id' | 'song_id'> &
  Partial<{
    canto: CantoPublic;
    evento: EventoPublic;
    gesto: GestoPublic;
    momento: MomentoPublic;
  }>;

/**
 * Trasforma il modello 'Registrazione' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const recordingToPublic = (recording: RegistrazioneConRelazioni): RegistrazionePublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { deed_id, event_id, moment_id, song_id, song, event, deed, moment, ..._recording } = recording;
  const registazionePublic: RegistrazionePublic = _recording;

  if (song) {
    logger.trace({ id: recording.id, cantoId: song.id }, "toPublic 'registrazione': aggiunta 'canto'");
    registazionePublic.canto = songToPublic(song);
  }
  if (event) {
    logger.trace({ id: recording.id, eventoId: event.id }, "toPublic 'registrazione': aggiunta 'evento'");
    registazionePublic.evento = eventToPublic(event);
  }
  if (deed) {
    logger.trace({ id: recording.id, gestoId: deed.id }, "toPublic 'registrazione': aggiunta 'gesto'");
    registazionePublic.gesto = deedToPublic(deed);
  }
  if (moment) {
    logger.trace({ id: recording.id, momentoId: moment.id }, "toPublic 'registrazione': aggiunta 'momento'");
    registazionePublic.momento = momentToPublic(moment);
  }

  return registazionePublic;
};
