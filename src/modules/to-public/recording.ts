import type { Deed, Event, Moment, Recording, Song } from '@prisma/client';

import type { ModuleAssets } from '../../middlewares/moduleAssets';
import type { DeedPublic } from './deed';
import { deedToPublic } from './deed';
import type { EventPublic } from './event';
import { eventToPublic } from './event';
import type { MomentPublic } from './moment';
import { momentToPublic } from './moment';
import type { SongPublic } from './song';
import { songToPublic } from './song';

/**
 * input composto da modello con relazioni per trasformare 'Registrazione' nell'interfaccia pubblica
 * @since 1.0.0
 */
export type RecordingWithRelated = Recording &
  Partial<{
    deed: Deed | null;
    event: Event | null;
    moment: Moment | null;
    song: Song | null;
  }>;

/**
 * interfaccia pubblica per 'Registrazione'
 * @since 1.0.0
 */
export type RecordingPublic = Omit<Recording, 'deed_id' | 'event_id' | 'moment_id' | 'song_id'> &
  Partial<{
    deed: DeedPublic;
    event: EventPublic;
    moment: MomentPublic;
    song: SongPublic;
  }>;

/**
 * Trasforma il modello 'Registrazione' nell'interfaccia pubblica. Aggiunge le eventuali relazioni
 * @since 1.0.0
 */
export const recordingToPublic = (moduleAssets: ModuleAssets, recording: RecordingWithRelated): RecordingPublic => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { deed_id, event_id, moment_id, song_id, song, event, deed, moment, ..._recording } = recording;
  const registazionePublic: RecordingPublic = _recording;

  if (song) {
    moduleAssets.logger.trace({ id: recording.id, songId: song.id }, "toPublic 'recording': add 'song'");
    registazionePublic.song = songToPublic(moduleAssets, song);
  }
  if (event) {
    moduleAssets.logger.trace({ id: recording.id, eventId: event.id }, "toPublic 'recording': add 'event'");
    registazionePublic.event = eventToPublic(moduleAssets, event);
  }
  if (deed) {
    moduleAssets.logger.trace({ id: recording.id, deedId: deed.id }, "toPublic 'recording': add 'deed'");
    registazionePublic.deed = deedToPublic(moduleAssets, deed);
  }
  if (moment) {
    moduleAssets.logger.trace({ id: recording.id, momentId: moment.id }, "toPublic 'recording': add 'moment'");
    registazionePublic.moment = momentToPublic(moduleAssets, moment);
  }

  return registazionePublic;
};
