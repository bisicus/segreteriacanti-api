import type { Author, Deed, Event, Moment, Recording } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { StatusCodes } from 'http-status-codes';

import { BaseError } from '../../errors/BaseError';
import type { ModuleAssets } from '../../middlewares/moduleAssets';
import type { SchemaRecordImport, SchemaRecordImportList } from '../../validators';
import { db } from '../db';

/**
 * Flusso
 * ------
 * 1. se non esiste crea 'canto', con relativi 'autore'
 * 2. se non esistono, crea 'evento', 'momento', 'gesto'
 * 3. crea registrazione e associala alle entità precedenti
 *
 * Note
 * ----
 * - Assunzione 1: se un canto è già stato creato, allora anche i suoi autori già esistono
 * @since 1.0.0
 * @todo si può ottimizzare con `createMany`
 * @todo TRANSAZIONI
 * @todo validazione: può essere che la registrazione già esista; trovare un modo per sgamare i duplicati
 * @todo wrapper per PrismaError
 */
export const importRecords = async (moduleAssets: ModuleAssets, importDescriptor: SchemaRecordImportList) => {
  try {
    // MAIN VARIABLES
    const recordings: Recording[] = [];

    // ----- PRELIMINARI ----- //
    const { DbAuthors, DbDeeds, DbEvents, DbMoments, DbSongs } = await _fetchImportExistentResources(importDescriptor);

    // ----- CREAZIONE RISORSE A PARTIRE DALL'IMPORT REGISTRAZIONI ----- //
    for (const importRow of importDescriptor) {
      // CANTO E AUTORI
      let relatedDbSong = DbSongs.find((_c) => _c.title === importRow.titolo);
      if (relatedDbSong) {
        moduleAssets.logger.debug({ title: importRow.titolo }, 'already existing song to assign to recording');
      } else {
        moduleAssets.logger.info({ title: importRow.titolo }, "CREATE: 'song'");

        // cerca tra gli autori ed eventualmente creali
        const authorsToRelate: Author[] = [];
        for (const authorNeedle of importRow.autori) {
          const _relatedDbAuthor = DbAuthors.find((_a) => _a.name === authorNeedle);

          if (_relatedDbAuthor) {
            moduleAssets.logger.debug({ author: authorNeedle, titolo: importRow.titolo }, 'already existing author to assign to song');
            authorsToRelate.push(_relatedDbAuthor);
          } else {
            moduleAssets.logger.debug({ author: authorNeedle }, "CREATING: 'Author'");
            const _newAuthor = await db.author.create({
              data: {
                name: authorNeedle,
                createdBy: moduleAssets.sessionId,
                updatedBy: moduleAssets.sessionId,
              },
            });
            moduleAssets.logger.info({ name: _newAuthor.name, id: _newAuthor.id }, "CREATE: 'author'");
            authorsToRelate.push(_newAuthor);

            // il nuovo autore potrebbe essere utile per successivi import. Evito una nuova query
            moduleAssets.logger.debug({ author: authorNeedle }, 'add author to list fetch from DB');
            DbAuthors.push(_newAuthor);
          }
        }

        // creazione canto
        relatedDbSong = await db.song.create({
          data: {
            title: importRow.titolo,
            authors: {
              connect: authorsToRelate,
            },
          },
        });
        moduleAssets.logger.info({ name: relatedDbSong.title, id: relatedDbSong.id }, "CREATE: 'song'");
      }

      // EVENTO, GESTO, MOMENTO
      const [deed, event, moment] = await Promise.all([
        _findOrCreateDeed(moduleAssets, importRow, DbDeeds),
        _findOrCreateEvent(moduleAssets, importRow, DbEvents),
        _findOrCreateMoment(moduleAssets, importRow, DbMoments),
      ]);

      // REGISTRAZIONE
      moduleAssets.logger.debug({ title: importRow.titolo }, "CREATING: 'recording' for 'song'");
      const newRecording = await db.recording.create({
        data: {
          comment: importRow.commento ?? null,
          evaluation: importRow.valutazione,
          song: {
            connect: relatedDbSong,
          },
          event: {
            connect: event,
          },
          deed: {
            connect: deed,
          },
          moment: {
            connect: moment,
          },
          createdBy: moduleAssets.sessionId,
          updatedBy: moduleAssets.sessionId,
        },
      });
      moduleAssets.logger.info({ id: newRecording.id }, "CREATE: 'recording'");

      recordings.push(newRecording);
    }

    return recordings;
  } catch (err) {
    if (err instanceof PrismaClientValidationError) {
      throw new BaseError(err.name, err.message, StatusCodes.INTERNAL_SERVER_ERROR);
    } else if (err instanceof Error) {
      throw new BaseError(err.name, err.message, StatusCodes.INTERNAL_SERVER_ERROR);
    } else {
      throw err;
    }
  }
};

/**
 * Cerca nel DB tutte le risorse che già esistono per questo import
 * @since 1.0.0
 * @todo supportare 'gesto', 'evento', 'momento' come `null` o stringa vuota
 * @todo valutare sostituzione 'in' clause con 'in like' clause
 */
const _fetchImportExistentResources = async (importDescriptor: SchemaRecordImportList) => {
  const importAuthors = [...new Set(importDescriptor.flatMap((record) => record.autori))];
  const importDeeds = [...new Set(importDescriptor.map((record) => record.gesto))];
  const importEvents = [...new Set(importDescriptor.map((record) => record.eventoNome))];
  const importMoments = [...new Set(importDescriptor.map((record) => record.momento))];
  const importSongs = importDescriptor.map((record) => record.titolo);

  const [DbAuthors, DbDeeds, DbEvents, DbMoments, DbSongs] = await Promise.all([
    // cerca autori già caricati
    db.author.findMany({
      where: {
        name: {
          in: importAuthors,
        },
      },
    }),
    // cerca gesti già caricati
    db.deed.findMany({
      where: {
        type: {
          in: importDeeds,
        },
      },
    }),
    // cerca eventi già caricati
    db.event.findMany({
      where: {
        name: {
          in: importEvents,
        },
      },
    }),
    // cerca momenti già caricati
    db.moment.findMany({
      where: {
        occurredOn: {
          in: importMoments,
        },
      },
    }),
    // cerca canti già caricati
    db.song.findMany({
      where: {
        title: {
          in: importSongs,
        },
      },
    }),
  ]);

  return {
    DbAuthors,
    DbDeeds,
    DbEvents,
    DbMoments,
    DbSongs,
  };
};

/**
 * Cerca un "evento" tra quelli recuperati dal DB. Se non esiste, la risorsa viene creata.
 * @since 1.0.0
 * @todo sostituire i `moduleAssets.sessionId` di `createdBy` e `updatedBy` con la sessione attiva
 * @todo sostituire `logger` generico con 'requestLogger' usando `moduleAssets`
 * @todo valutare se eventoInizio e eventoFine possono essere opzionali nel modello
 */
const _findOrCreateEvent = async (moduleAssets: ModuleAssets, importRow: SchemaRecordImport, DbEvents: Event[]) => {
  let relatedDbEvent = DbEvents.find((_e) => _e.name === importRow.eventoNome);
  if (relatedDbEvent) {
    moduleAssets.logger.debug({ title: importRow.titolo }, 'already existing event to assign to recording');
  } else {
    // creazione evento
    moduleAssets.logger.debug({ title: importRow.titolo }, "CREATING: 'event'");
    relatedDbEvent = await db.event.create({
      data: {
        name: importRow.eventoNome,
        startDate: importRow.eventoInizio ? new Date(importRow.eventoInizio) : new Date(),
        endDate: importRow.eventoFine ? new Date(importRow.eventoFine) : new Date(),
        createdBy: moduleAssets.sessionId,
        updatedBy: moduleAssets.sessionId,
      },
    });
    moduleAssets.logger.info({ name: relatedDbEvent.name, id: relatedDbEvent.id }, "CREATE: 'event'");

    moduleAssets.logger.debug({ event: relatedDbEvent.name }, 'add event to list fetch from DB');
    DbEvents.push(relatedDbEvent);
  }

  return relatedDbEvent;
};

/**
 * Cerca un "gesto" tra quelli recuperati dal DB. Se non esiste, la risorsa viene creata.
 * @since 1.0.0
 */
const _findOrCreateDeed = async (moduleAssets: ModuleAssets, importRow: SchemaRecordImport, DbDeeds: Deed[]) => {
  let relatedDbDeed = DbDeeds.find((_g) => _g.type === importRow.gesto);
  if (relatedDbDeed) {
    moduleAssets.logger.debug({ type: importRow.gesto }, 'already existing deed to assign to recording');
  } else {
    // creazione evento
    moduleAssets.logger.debug({ type: importRow.gesto }, "CREATING: 'deed'");
    relatedDbDeed = await db.deed.create({
      data: {
        type: importRow.gesto,
        createdBy: moduleAssets.sessionId,
        updatedBy: moduleAssets.sessionId,
      },
    });
    moduleAssets.logger.info({ tipo: relatedDbDeed.type, id: relatedDbDeed.id }, "CREATE: 'deed'");

    moduleAssets.logger.debug({ name: importRow.gesto }, 'add deed to list fetch from DB');
    DbDeeds.push(relatedDbDeed);
  }

  return relatedDbDeed;
};

/**
 * Cerca un "momento" tra quelli recuperati dal DB. Se non esiste, la risorsa viene creata.
 * @since 1.0.0
 */
const _findOrCreateMoment = async (moduleAssets: ModuleAssets, importRow: SchemaRecordImport, DbMoments: Moment[]) => {
  let relatedDbMoment = DbMoments.find((_m) => _m.occurredOn === importRow.momento);
  if (relatedDbMoment) {
    moduleAssets.logger.debug({ occurredOn: importRow.momento }, 'already existing moment to assign to recording');
  } else {
    // creazione momento
    moduleAssets.logger.debug({ occurredOn: importRow.momento }, "CREATING: 'moment'");
    relatedDbMoment = await db.moment.create({
      data: {
        occurredOn: importRow.momento,
        createdBy: moduleAssets.sessionId,
        updatedBy: moduleAssets.sessionId,
      },
    });
    moduleAssets.logger.info({ occurredOn: relatedDbMoment.occurredOn, id: relatedDbMoment.id }, "CREATE: 'moment'");

    moduleAssets.logger.debug({ occurredOn: importRow.momento }, 'add momento to list fetch from DB');
    DbMoments.push(relatedDbMoment);
  }
  return relatedDbMoment;
};
