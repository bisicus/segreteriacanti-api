import type { Deed, Recording } from '@prisma/client';

import logger from '../logger';
import type { RegistrazionePublic } from './registrazione';
import { registrazioneToPublic } from './registrazione';

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
    registrazioni: RegistrazionePublic[];
  }>;

/**
 * Trasforma il modello 'Gesto' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const gestoToPublic = (gesto: GestoConRelazioni): GestoPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { recordings: registrazioni, ..._gesto } = gesto;
  const gestoPublic: GestoPublic = _gesto;

  if (Array.isArray(registrazioni)) {
    gestoPublic.registrazioni = registrazioni.map((_r) => {
      logger.trace({ id: gesto.id, registrazioneId: _r.id }, "toPublic 'gesto': aggiunta 'registrazione'");
      return registrazioneToPublic(_r);
    });
  }

  return gestoPublic;
};
