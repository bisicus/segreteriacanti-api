import type { Event, Recording } from '@prisma/client';

import logger from '../logger';
import type { RegistrazionePublic } from './recording';
import { registrazioneToPublic } from './recording';

/**
 * input composto da modello con relazioni per trasformare 'Evento' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type EventoConRelazioni = Event &
  Partial<{
    recordings: Recording[];
  }>;

/**
 * interfaccia pubblica per 'Evento'
 * @since 1.0.0
 */
export type EventoPublic = Event &
  Partial<{
    registrazioni: RegistrazionePublic[];
  }>;

/**
 * Trasforma il modello 'Evento' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const eventoToPublic = (evento: EventoConRelazioni): EventoPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { recordings: registrazioni, ..._evento } = evento;
  const eventoPublic: EventoPublic = _evento;

  if (Array.isArray(registrazioni)) {
    eventoPublic.registrazioni = registrazioni.map((_r) => {
      logger.trace({ id: evento.id, registrazioneId: _r.id }, "toPublic 'evento': aggiunta 'registrazione'");
      return registrazioneToPublic(_r);
    });
  }

  return eventoPublic;
};
