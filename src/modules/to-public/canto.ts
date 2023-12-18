import type { Autore, Canto, Registrazione } from '@prisma/client';

import logger from '../logger';
import type { AutorePublic } from './autore';
import { autoreToPublic } from './autore';
import type { RegistrazionePublic } from './registrazione';
import { registrazioneToPublic } from './registrazione';

/**
 * input composto da modello con relazioni per trasformare 'Canto' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type CantoConRelazioni = Canto &
  Partial<{
    autori: Autore[];
    registrazioni: Registrazione[];
  }>;

/**
 * interfaccia pubblica per 'Canto'
 * @since 1.0.0
 */
export type CantoPublic = Canto &
  Partial<{
    autori: AutorePublic[];
    registrazioni: RegistrazionePublic[];
  }>;

/**
 * Trasforma il modello 'Canto' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const cantoToPublic = (canto: CantoConRelazioni): CantoPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { autori, registrazioni, ..._canto } = canto;
  const cantoPublic: CantoPublic = _canto;

  if (Array.isArray(autori)) {
    cantoPublic.autori = autori.map((_a) => {
      logger.trace({ id: canto.id, autoreId: _a.id }, "toPublic 'canto': aggiunta 'autore'");
      return autoreToPublic(_a);
    });
  }
  if (Array.isArray(registrazioni)) {
    cantoPublic.registrazioni = registrazioni.map((_r) => {
      logger.trace({ id: canto.id, registrazioneId: _r.id }, "toPublic 'canto': aggiunta 'registrazione'");
      return registrazioneToPublic(_r);
    });
  }

  return cantoPublic;
};
