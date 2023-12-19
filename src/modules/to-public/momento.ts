import type { Momento, Registrazione } from '@prisma/client';

import logger from '../logger';
import type { RegistrazionePublic } from './registrazione';
import { registrazioneToPublic } from './registrazione';

/**
 * input composto da modello con relazioni per trasformare 'Momento' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type MomentoConRelazioni = Momento &
  Partial<{
    registrazioni: Registrazione[];
  }>;

/**
 * interfaccia pubblica per 'Momento'
 * @since 1.0.0
 */
export type MomentoPublic = Momento &
  Partial<{
    registrazioni: RegistrazionePublic[];
  }>;

/**
 * Trasforma il modello 'Momento' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const momentoToPublic = (momento: MomentoConRelazioni): MomentoPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { registrazioni, ..._momento } = momento;
  const momentoPublic: MomentoPublic = _momento;

  if (Array.isArray(registrazioni)) {
    momentoPublic.registrazioni = registrazioni.map((_r) => {
      logger.trace({ id: momento.id, registrazioneId: _r.id }, "toPublic 'momento': aggiunta 'registrazione'");
      return registrazioneToPublic(_r);
    });
  }

  return momentoPublic;
};
