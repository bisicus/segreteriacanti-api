import type { Author, Song } from '@prisma/client';

import logger from '../logger';
import type { CantoPublic } from './song';
import { songToPublic } from './song';

/**
 * input composto da modello con relazioni per trasformare 'Autore' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type AutoreConRelazioni = Author &
  Partial<{
    songs: Song[];
  }>;

/**
 * interfaccia pubblica per 'Autore'
 * @since 1.0.0
 */
export type AutorePublic = Author &
  Partial<{
    songs: CantoPublic[];
  }>;

/**
 * Trasforma il modello 'Autore' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const authorToPublic = (author: AutoreConRelazioni): AutorePublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { songs, ..._author } = author;
  const authorPublic: AutorePublic = _author;

  if (songs) {
    authorPublic.songs = songs.map((_c) => {
      logger.trace({ id: author.id, cantoId: _c.id }, "toPublic 'autore': aggiunta 'registrazione'");
      return songToPublic(_c);
    });
  }

  return authorPublic;
};
