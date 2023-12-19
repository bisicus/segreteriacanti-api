import type { Canto, Registrazione } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * @since 1.0.0
 */
export type RegistrazioneConTitoloCanto = Registrazione & { canto: null | { nome: Canto['nome'] } };

/**
 * Crea un nome univoco per la ref del file
 * 1. Se già esiste, usa `refAudio`
 * 2. Se la registrazione è associata ad un canto, usa il titolo
 * 3. fail-safe value: `uuid`
 * @since 1.0.0
 * @todo sanificare `canto.nome`
 */
export const forgeFilename = (registrazione: RegistrazioneConTitoloCanto) => {
  let fileRef: string;

  if (registrazione.refAudio) {
    fileRef = registrazione.refAudio;
  } else {
    if (registrazione.canto) {
      fileRef = registrazione.canto.nome;
    } else {
      fileRef = uuidv4();
    }
  }

  return fileRef;
};
