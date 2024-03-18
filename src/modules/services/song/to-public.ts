import type { Author, Recording, Song, Translation } from '@prisma/client';

import type { ModuleAssets } from '../../../middlewares/moduleAssets';
import { type AuthorPublic, authorToPublic } from '../author';
import { type RecordingPublic, recordingToPublic } from '../recording';
import { type TranslationPublic, traslationToPublic } from '../translations';

/**
 * input composto da modello con relazioni per trasformare 'Canto' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type SongWithRelated = Song &
  Partial<{
    authors: Author[];
    recordings: Recording[];
    translations: Translation[];
  }>;

/**
 * interfaccia pubblica per 'Canto'
 * @since 1.0.0
 */
export type SongPublic = Song &
  Partial<{
    authors: AuthorPublic[];
    recordings: RecordingPublic[];
    translations: TranslationPublic[];
  }>;

/**
 * Trasforma il modello 'Canto' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const songToPublic = (moduleAssets: ModuleAssets, song: SongWithRelated): SongPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { authors, recordings, translations, ..._song } = song;
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
  if (Array.isArray(translations)) {
    songPublic.translations = translations.map((_t) => {
      moduleAssets.logger.trace({ id: song.id, translationId: _t.id }, "toPublic 'song': add 'translation'");
      return traslationToPublic(moduleAssets, _t);
    });
  }

  return songPublic;
};
