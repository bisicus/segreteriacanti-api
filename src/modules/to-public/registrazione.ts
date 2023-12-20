import type { Deed, Event, Moment, Recording, Song } from '@prisma/client';

import logger from '../logger';
import type { CantoPublic } from './canto';
import { cantoToPublic } from './canto';
import type { EventoPublic } from './evento';
import { eventoToPublic } from './evento';
import type { GestoPublic } from './gesto';
import { gestoToPublic } from './gesto';
import type { MomentoPublic } from './momento';
import { momentoToPublic } from './momento';

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
export const registrazioneToPublic = (registazione: RegistrazioneConRelazioni): RegistrazionePublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { deed_id, event_id, moment_id, song_id, song: canto, event: evento, deed: gesto, moment: momento, ..._registrazione } = registazione;
  const registazionePublic: RegistrazionePublic = _registrazione;

  if (canto) {
    logger.trace({ id: registazione.id, cantoId: canto.id }, "toPublic 'registrazione': aggiunta 'canto'");
    registazionePublic.canto = cantoToPublic(canto);
  }
  if (evento) {
    logger.trace({ id: registazione.id, eventoId: evento.id }, "toPublic 'registrazione': aggiunta 'evento'");
    registazionePublic.evento = eventoToPublic(evento);
  }
  if (gesto) {
    logger.trace({ id: registazione.id, gestoId: gesto.id }, "toPublic 'registrazione': aggiunta 'gesto'");
    registazionePublic.gesto = gestoToPublic(gesto);
  }
  if (momento) {
    logger.trace({ id: registazione.id, momentoId: momento.id }, "toPublic 'registrazione': aggiunta 'momento'");
    registazionePublic.momento = momentoToPublic(momento);
  }

  return registazionePublic;
};
