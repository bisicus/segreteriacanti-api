import type { Author, Recording, Song } from '@prisma/client';

import type { ModuleAssets } from '../../middlewares/moduleAssets';
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
export const songToPublic = (moduleAssets: ModuleAssets, song: SongWithRelated): SongPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { authors, recordings, ..._song } = song;
  const songPublic: SongPublic = _song;

  if (Array.isArray(authors)) {
    songPublic.authors = authors.map((_a) => {
      moduleAssets.logger.trace({ id: song.id, autoreId: _a.id }, "toPublic 'canto': aggiunta 'autore'");
      return authorToPublic(moduleAssets, _a);
    });
  }
  if (Array.isArray(recordings)) {
    songPublic.recordings = recordings.map((_r) => {
      moduleAssets.logger.trace({ id: song.id, registrazioneId: _r.id }, "toPublic 'canto': aggiunta 'registrazione'");
      return recordingToPublic(moduleAssets, _r);
    });
  }

  return songPublic;
};
