import type { Author, Recording, Song } from '@prisma/client';

import logger from '../logger';
import type { AuthorPublic } from './author';
import { authorToPublic } from './author';
import type { RecordingPublic } from './recording';
import { recordingToPublic } from './recording';

/**
 * input composto da modello con relazioni per trasformare 'Canto' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type SongWithRelated = Song &
  Partial<{
    authors: Author[];
    recordings: Recording[];
  }>;

/**
 * interfaccia pubblica per 'Canto'
 * @since 1.0.0
 */
export type SongPublic = Song &
  Partial<{
    authors: AuthorPublic[];
    recordings: RecordingPublic[];
  }>;

/**
 * Trasforma il modello 'Canto' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const songToPublic = (song: SongWithRelated): SongPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { authors, recordings, ..._song } = song;
  const songPublic: SongPublic = _song;

  if (Array.isArray(authors)) {
    songPublic.authors = authors.map((_a) => {
      logger.trace({ id: song.id, autoreId: _a.id }, "toPublic 'canto': aggiunta 'autore'");
      return authorToPublic(_a);
    });
  }
  if (Array.isArray(recordings)) {
    songPublic.recordings = recordings.map((_r) => {
      logger.trace({ id: song.id, registrazioneId: _r.id }, "toPublic 'canto': aggiunta 'registrazione'");
      return recordingToPublic(_r);
    });
  }

  return songPublic;
};
