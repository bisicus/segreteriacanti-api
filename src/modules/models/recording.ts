import type { Recording, Song } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * @since 1.0.0
 */
export type RegistrazioneConTitoloCanto = Recording & { song: null | { title: Song['title'] } };

/**
 * Crea un nome univoco per la ref del file
 * 1. Se già esiste, usa `refAudio`
 * 2. Se la registrazione è associata ad un canto, usa il titolo
 * 3. fail-safe value: `uuid`
 * @since 1.0.0
 * @todo sanificare `canto.nome`
 */
export const forgeFilename = (recording: RegistrazioneConTitoloCanto) => {
  let fileRef: string;

  if (recording.refAudio) {
    fileRef = recording.refAudio;
  } else {
    if (recording.song) {
      fileRef = recording.song.title;
    } else {
      fileRef = uuidv4();
    }
  }

  return fileRef;
};
