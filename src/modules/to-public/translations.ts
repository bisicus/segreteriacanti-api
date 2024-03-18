import type { Song, Translation } from '@prisma/client';

import type { ModuleAssets } from '../../middlewares/moduleAssets';
import { type SongPublic, songToPublic } from './song';

/**
 * Model with eventually related entities to be exported to public interface
 * @since 1.0.0
 */
export type TranslationWithRelated = Translation &
  Partial<{
    song: Song | null;
  }>;

/**
 * interfaccia pubblica per 'Canto'
 * @since 1.0.0
 */
export type TranslationPublic = Translation &
  Partial<{
    song: SongPublic;
  }>;

/**
 * Morph model to public interface. If model has relations include them.
 * @since 1.0.0
 */
export const traslationToPublic = (moduleAssets: ModuleAssets, translation: TranslationWithRelated): TranslationPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { song, ..._translation } = translation;
  const translationPublic: TranslationPublic = _translation;

  if (song) {
    moduleAssets.logger.trace({ id: translation.id, songId: song.id }, "toPublic 'translation': add 'song'");
    translationPublic.song = songToPublic(moduleAssets, song);
  }

  return translationPublic;
};
