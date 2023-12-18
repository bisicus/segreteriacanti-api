import type { Autore, Canto } from '@prisma/client';

import logger from '../logger';
import type { CantoPublic } from './canto';
import { cantoToPublic } from './canto';

/**
 * input composto da modello con relazioni per trasformare 'Autore' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type AutoreConRelazioni = Autore &
  Partial<{
    canti: Canto[];
  }>;

/**
 * interfaccia pubblica per 'Autore'
 * @since 1.0.0
 */
export type AutorePublic = Autore &
  Partial<{
    canti: CantoPublic[];
  }>;

/**
 * Trasforma il modello 'Autore' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const autoreToPublic = (autore: AutoreConRelazioni): AutorePublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { canti, ..._autore } = autore;
  const autorePublic: AutorePublic = _autore;

  if (canti) {
    autorePublic.canti = canti.map((_c) => {
      logger.trace({ id: autore.id, cantoId: _c.id }, "toPublic 'autore': aggiunta 'registrazione'");
      return cantoToPublic(_c);
    });
  }

  return autorePublic;
};
